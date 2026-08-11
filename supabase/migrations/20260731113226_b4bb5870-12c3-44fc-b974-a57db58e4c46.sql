UPDATE public.products SET name = 'Plain Batter', unit = '1 litre', price_paise = 8400, mrp_paise = 9600 WHERE name = 'Plain Idly/Dosa Batter';
UPDATE public.products SET is_active = false WHERE name = 'Millet Dosa Batter';

INSERT INTO public.products (category_id, name, description, unit, mrp_paise, price_paise, is_active, stock)
SELECT c.id, v.name, v.descr, '1 litre', 9600, 8400, true, 100
FROM public.categories c
CROSS JOIN (VALUES
  ('Karuppu Kavuni Batter', 'Black rice batter — fibre rich (Monday special)'),
  ('Kambu Batter', 'Pearl millet batter — cooling (Tuesday special)'),
  ('Mappillai Samba Batter', 'Heritage red rice batter (Wednesday special)'),
  ('Ragi Batter', 'Finger millet batter — iron & calcium (Thursday special)'),
  ('Karittuyanam Batter', 'Kattuyanam rice batter — cardiac wellness (Friday special)'),
  ('Cholam Batter', 'Sorghum batter — gluten friendly (Saturday special)')
) AS v(name, descr)
WHERE c.slug = 'batter'
  AND NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);