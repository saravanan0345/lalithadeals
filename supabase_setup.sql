-- ==============================================================================
-- LALITHA / L DEALS - COMPLETE SUPABASE SETUP SCRIPT
-- Paste this entire script into your Supabase Dashboard -> SQL Editor and click RUN.
-- It sets up all tables, triggers, storage bucket, policies, and the admin account.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create custom enum types
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shop_section') THEN
    CREATE TYPE public.shop_section AS ENUM ('costumes', 'frames', 'gifts');
  END IF;
END $$;

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create has_role security function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "own roles" ON public.user_roles;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 5. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner profile read" ON public.profiles;
CREATE POLICY "owner profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "owner profile update" ON public.profiles;
CREATE POLICY "owner profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Profile trigger
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', 'Owner'))
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- Admin auto-grant trigger
CREATE OR REPLACE FUNCTION public.assign_owner_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(new.email) = 'lalithadeals@lalitha.local' THEN
    INSERT INTO public.user_roles(user_id, role)
    VALUES (new.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN new;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_owner_admin();

-- 6. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  section public.shop_section NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO authenticated, service_role;

DROP POLICY IF EXISTS "public read" ON public.categories;
CREATE POLICY "public read" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin write" ON public.categories;
CREATE POLICY "admin write" ON public.categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section public.shop_section NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  image_path text,
  mrp numeric(10,2),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  age_info text,
  size_info text,
  is_available boolean NOT NULL DEFAULT true,
  stock int,
  rental_terms text,
  customization text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (mrp IS NULL OR (mrp > 0 AND price <= mrp))
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO authenticated, service_role;

DROP POLICY IF EXISTS "public read" ON public.products;
CREATE POLICY "public read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin write" ON public.products;
CREATE POLICY "admin write" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_path text,
  offer_type text NOT NULL CHECK (offer_type IN ('percent', 'flat', 'bogo', 'bundle')),
  value numeric(10,2) NOT NULL DEFAULT 0,
  buy_qty int NOT NULL DEFAULT 1,
  get_qty int NOT NULL DEFAULT 1,
  product_ids uuid[] NOT NULL DEFAULT '{}',
  conditions text,
  starts_at date,
  ends_at date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT ALL ON public.offers TO authenticated, service_role;

DROP POLICY IF EXISTS "public read active" ON public.offers;
CREATE POLICY "public read active" ON public.offers FOR SELECT
  USING (is_active OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin write" ON public.offers;
CREATE POLICY "admin write" ON public.offers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 9. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  email text,
  fulfilment text NOT NULL CHECK (fulfilment IN ('delivery', 'pickup')),
  address text,
  notes text,
  items jsonb NOT NULL,
  applied_offers jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(10,2) NOT NULL,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'ready', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
GRANT SELECT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

DROP POLICY IF EXISTS "admin read" ON public.orders;
CREATE POLICY "admin read" ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin update" ON public.orders;
CREATE POLICY "admin update" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin delete" ON public.orders;
CREATE POLICY "admin delete" ON public.orders FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  address text,
  maps_link text,
  about text,
  rental_terms text,
  deposit_info text,
  delivery_info text,
  frame_instructions text,
  hero_image_path text,
  hero_alt text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT UPDATE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;

DROP POLICY IF EXISTS "public read" ON public.settings;
CREATE POLICY "public read" ON public.settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin update" ON public.settings;
CREATE POLICY "admin update" ON public.settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default settings row
INSERT INTO public.settings (
  id,
  address,
  maps_link,
  about,
  rental_terms,
  deposit_info,
  delivery_info,
  frame_instructions,
  hero_alt
) VALUES (
  1,
  '3/237, Sri Kamatchi street, Padmavati Nagar, Iyyappanthangal near oil mill road',
  'https://maps.app.goo.gl/JE4r246QNFvA5oed6',
  'Costumes, photo frames and gifts for every little celebration.',
  'Costume rentals available for 24-48 hours. Please handle costumes with care.',
  'Refundable deposit required at the time of pickup.',
  'Store pickup in Iyyappanthangal or delivery via Dunzo/Porter at actuals.',
  'Send high-resolution photos via WhatsApp for best frame results.',
  'Costumes on a rack beside a gift box and photo frame'
) ON CONFLICT (id) DO UPDATE SET
  address = EXCLUDED.address,
  maps_link = EXCLUDED.maps_link;

-- Seed default categories
INSERT INTO public.categories (name, section, sort_order) VALUES
  ('Superhero-inspired', 'costumes', 1),
  ('Police & Uniforms', 'costumes', 2),
  ('Freedom Fighters & Historical', 'costumes', 3),
  ('Mythological & Devotional', 'costumes', 4),
  ('Fancy Dress & Events', 'costumes', 5),
  ('Blazers', 'costumes', 6),
  ('Custom Photo Frames', 'frames', 1),
  ('Gifts', 'gifts', 1)
ON CONFLICT DO NOTHING;

-- 11. Storage bucket setup for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "admin read images" ON storage.objects;
CREATE POLICY "admin read images" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin upload images" ON storage.objects;
CREATE POLICY "admin upload images" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin update images" ON storage.objects;
CREATE POLICY "admin update images" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin delete images" ON storage.objects;
CREATE POLICY "admin delete images" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

-- 12. Create the Admin User in auth.users
-- Username: lalithadeals
-- Password: lalithadeals@123
DO $$
DECLARE
  new_uid uuid := gen_random_uuid();
  admin_email text := 'lalithadeals@lalitha.local';
  hashed_pwd text := crypt('lalithadeals@123', gen_salt('bf'));
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_uid,
      'authenticated',
      'authenticated',
      admin_email,
      hashed_pwd,
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Lalitha Deals Admin"}',
      now(),
      now()
    );
  ELSE
    UPDATE auth.users
    SET encrypted_password = hashed_pwd,
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE email = admin_email;
  END IF;

  -- Ensure role is granted
  INSERT INTO public.user_roles (user_id, role)
  SELECT id, 'admin'::public.app_role
  FROM auth.users
  WHERE email = admin_email
  ON CONFLICT DO NOTHING;

  -- Ensure profile exists
  INSERT INTO public.profiles (id, display_name)
  SELECT id, 'Lalitha Deals Admin'
  FROM auth.users
  WHERE email = admin_email
  ON CONFLICT (id) DO NOTHING;
END $$;
