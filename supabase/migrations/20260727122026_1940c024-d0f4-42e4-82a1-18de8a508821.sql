
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('customer', 'admin', 'delivery');
CREATE TYPE public.plan_type AS ENUM ('weekly', 'monthly');
CREATE TYPE public.sub_status AS ENUM ('active','paused','cancelled','completed','pending');
CREATE TYPE public.assign_status AS ENUM ('pending','out_for_delivery','delivered','failed','skipped');

-- Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile write" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- User roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role)
$$;

-- Auto profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin write categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT '1 kg',
  mrp_paise int NOT NULL,
  price_paise int NOT NULL,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  stock int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Addresses
CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL DEFAULT 'Erode',
  pincode text NOT NULL,
  lat double precision,
  lng double precision,
  building_image_url text,
  landmark text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own addr" ON public.addresses FOR ALL TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delivery')) WITH CHECK (auth.uid()=user_id);

-- Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_id uuid NOT NULL REFERENCES public.addresses(id),
  plan public.plan_type NOT NULL,
  status public.sub_status NOT NULL DEFAULT 'active',
  start_date date NOT NULL,
  end_date date NOT NULL,
  time_slot text NOT NULL DEFAULT '6-8 AM',
  total_paise int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own subs" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delivery'));
CREATE POLICY "insert own subs" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "update own subs" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));

-- Subscription items (per weekday product picks)
CREATE TABLE public.subscription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  product_id uuid NOT NULL REFERENCES public.products(id),
  quantity int NOT NULL DEFAULT 1
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_items TO authenticated;
GRANT ALL ON public.subscription_items TO service_role;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sub items" ON public.subscription_items FOR ALL TO authenticated
USING (EXISTS(SELECT 1 FROM public.subscriptions s WHERE s.id=subscription_id AND (s.user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'delivery'))))
WITH CHECK (EXISTS(SELECT 1 FROM public.subscriptions s WHERE s.id=subscription_id AND s.user_id=auth.uid()));

-- Delivery assignments
CREATE TABLE public.delivery_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  delivery_date date NOT NULL,
  executive_id uuid REFERENCES auth.users(id),
  status public.assign_status NOT NULL DEFAULT 'pending',
  sequence int NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, delivery_date)
);
GRANT SELECT, INSERT, UPDATE ON public.delivery_assignments TO authenticated;
GRANT ALL ON public.delivery_assignments TO service_role;
ALTER TABLE public.delivery_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments visibility" ON public.delivery_assignments FOR SELECT TO authenticated USING (
  public.has_role(auth.uid(),'admin')
  OR (public.has_role(auth.uid(),'delivery') AND executive_id = auth.uid())
  OR EXISTS(SELECT 1 FROM public.subscriptions s WHERE s.id=subscription_id AND s.user_id=auth.uid())
);
CREATE POLICY "admin write assignments" ON public.delivery_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "delivery updates own" ON public.delivery_assignments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'delivery') AND executive_id=auth.uid());

-- Categories seed
INSERT INTO public.categories(slug,name,sort_order) VALUES
 ('batter','Fresh Batter',1),
 ('rice','Traditional Rice',2),
 ('millets','Millets',3),
 ('grocery','Grocery',4);

-- Product seed (Campo Offer: 10% off MRP)
-- Batter
INSERT INTO public.products(category_id,name,description,unit,mrp_paise,price_paise,image_url,stock)
SELECT id,'Plain Idly/Dosa Batter','Stone-ground, fermented overnight','1 kg',18000,16800,'https://images.unsplash.com/photo-1630383249896-c6cb1a7dc4e9?w=800',500 FROM public.categories WHERE slug='batter';
INSERT INTO public.products(category_id,name,description,unit,mrp_paise,price_paise,image_url,stock)
SELECT id,'Millet Dosa Batter','Ragi + kodo blend','1 kg',22000,20000,'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800',300 FROM public.categories WHERE slug='batter';

-- Rice (Campo Offer)
INSERT INTO public.products(category_id,name,unit,mrp_paise,price_paise,stock)
SELECT c.id, x.name, '1 kg', x.mrp, x.price, 100
FROM public.categories c, (VALUES
 ('Mapillai Samba', 15000, 13500),
 ('Kattuyanam',     16000, 14400),
 ('Karuppu Kavuni', 22000, 19800),
 ('Sivappu Kavuni', 20000, 18000),
 ('Kichadi Samba',  14000, 12600),
 ('Poongar',        15000, 13500),
 ('Kullakar',       15000, 13500),
 ('Thooyamalli',    14000, 12600),
 ('Rajamudi',       17000, 15300),
 ('Bamboo Rice',    25000, 22500),
 ('Salem Sanna',    12000, 10800),
 ('Seeraga Samba',  18000, 16200)
) AS x(name,mrp,price) WHERE c.slug='rice';

-- Millets
INSERT INTO public.products(category_id,name,unit,mrp_paise,price_paise,stock)
SELECT c.id, x.name, '1 kg', x.mrp, x.price, 100
FROM public.categories c, (VALUES
 ('Foxtail Millet',   12000, 10800),
 ('Kodo Millet',      13000, 11700),
 ('Barnyard Millet',  13000, 11700),
 ('Little Millet',    12500, 11250),
 ('Pearl Millet (Bajra)', 9000, 8100),
 ('Finger Millet (Ragi)', 8000, 7200),
 ('Sorghum (Jowar)',  9000, 8100),
 ('Proso Millet',     14000, 12600),
 ('Ragi Flour',       9500, 8550),
 ('Multi-Millet Mix', 15000, 13500),
 ('Browntop Millet',  14000, 12600)
) AS x(name,mrp,price) WHERE c.slug='millets';

-- Grocery basics
INSERT INTO public.products(category_id,name,unit,mrp_paise,price_paise,stock)
SELECT c.id, x.name, x.unit, x.mrp, x.price, 100
FROM public.categories c, (VALUES
 ('Cold-Pressed Groundnut Oil','1 L',35000,32000),
 ('Cold-Pressed Coconut Oil','1 L',42000,38000),
 ('Organic Jaggery','1 kg',12000,10800),
 ('Hand-Pounded Toor Dal','1 kg',18000,16200)
) AS x(name,unit,mrp,price) WHERE c.slug='grocery';
