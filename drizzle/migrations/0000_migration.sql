create type public.app_role as enum ('admin','user');
create table public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated; grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
create policy "own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.assign_owner_admin() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if lower(new.email) = 'lalithadeals@lalitha.local' then
    insert into public.user_roles(user_id, role) values (new.id, 'admin') on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.assign_owner_admin();

create type public.shop_section as enum ('costumes','frames','gifts');

create table public.categories (id uuid primary key default gen_random_uuid(), name text not null, section shop_section not null, sort_order int not null default 0, created_at timestamptz not null default now());
create table public.products (
  id uuid primary key default gen_random_uuid(),
  section shop_section not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  image_path text,
  mrp numeric(10,2),
  price numeric(10,2) not null check (price >= 0),
  age_info text, size_info text,
  is_available boolean not null default true,
  stock int,
  rental_terms text,
  customization text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  check (mrp is null or (mrp > 0 and price <= mrp))
);
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text, image_path text,
  offer_type text not null check (offer_type in ('percent','flat','bogo','bundle')),
  value numeric(10,2) not null default 0,
  buy_qty int not null default 1, get_qty int not null default 1,
  product_ids uuid[] not null default '{}',
  conditions text,
  starts_at date, ends_at date,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null, phone text not null, email text,
  fulfilment text not null check (fulfilment in ('delivery','pickup')),
  address text, notes text,
  items jsonb not null, applied_offers jsonb not null default '[]',
  subtotal numeric(10,2) not null, discount numeric(10,2) not null default 0, total numeric(10,2) not null,
  status text not null default 'new' check (status in ('new','confirmed','ready','completed','cancelled')),
  created_at timestamptz not null default now()
);
create table public.settings (
  id int primary key default 1 check (id = 1),
  address text, about text, rental_terms text, deposit_info text, delivery_info text, frame_instructions text,
  updated_at timestamptz not null default now()
);
insert into public.settings(id) values (1);

grant select on public.categories, public.products, public.offers, public.settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.offers to authenticated;
grant update on public.settings to authenticated;
grant select, update, delete on public.orders to authenticated;
grant all on public.categories, public.products, public.offers, public.orders, public.settings to service_role;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.orders enable row level security;
alter table public.settings enable row level security;

create policy "public read" on public.categories for select using (true);
create policy "public read" on public.products for select using (true);
create policy "public read" on public.settings for select using (true);
create policy "public read active" on public.offers for select using (is_active or public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.categories for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.products for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin write" on public.offers for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin read" on public.orders for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.orders for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.orders for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "admin read images" on storage.objects for select to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "admin upload images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "admin update images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));
create policy "admin delete images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.has_role(auth.uid(),'admin'));

insert into public.categories(name, section, sort_order) values
('Superhero-inspired','costumes',1),('Police & Uniforms','costumes',2),('Freedom Fighters & Historical','costumes',3),('Mythological & Devotional','costumes',4),('Fancy Dress & Events','costumes',5),('Blazers','costumes',6),
('Custom Photo Frames','frames',1),('Gifts','gifts',1);