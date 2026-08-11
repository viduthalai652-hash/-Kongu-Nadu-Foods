
DO $$
DECLARE
  v_admin uuid;
  v_delivery uuid;
  v_client uuid;
BEGIN
  -- Admin
  SELECT id INTO v_admin FROM auth.users WHERE email='admin@gmail.com';
  IF v_admin IS NULL THEN
    v_admin := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_admin, 'authenticated','authenticated','admin@gmail.com', crypt('admin12', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin User"}', false,'','','','');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_admin, v_admin::text, jsonb_build_object('sub', v_admin::text, 'email','admin@gmail.com'), 'email', now(), now(), now());
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (v_admin,'admin') ON CONFLICT DO NOTHING;

  -- Delivery
  SELECT id INTO v_delivery FROM auth.users WHERE email='deliveryboy@gmail.com';
  IF v_delivery IS NULL THEN
    v_delivery := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_delivery, 'authenticated','authenticated','deliveryboy@gmail.com', crypt('deliveryboy12', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Delivery Boy"}', false,'','','','');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_delivery, v_delivery::text, jsonb_build_object('sub', v_delivery::text, 'email','deliveryboy@gmail.com'), 'email', now(), now(), now());
  END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (v_delivery,'delivery') ON CONFLICT DO NOTHING;

  -- Client
  SELECT id INTO v_client FROM auth.users WHERE email='client@gmail.com';
  IF v_client IS NULL THEN
    v_client := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token)
    VALUES ('00000000-0000-0000-0000-000000000000', v_client, 'authenticated','authenticated','client@gmail.com', crypt('client12', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Client User"}', false,'','','','');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_client, v_client::text, jsonb_build_object('sub', v_client::text, 'email','client@gmail.com'), 'email', now(), now(), now());
  END IF;
END $$;
