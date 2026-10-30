-- REGNAR storefront schema. Applied to dedicated project dqmbdwhnifrdndtwrllt.
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.products (
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text,
  slug text not null unique,
  description_en text not null default '',
  description_ar text,
  category_id uuid references public.categories(id) on delete set null,
  price_aed numeric(10,2) not null check (price_aed >= 0),
  compare_at_price_aed numeric(10,2) check (compare_at_price_aed is null or compare_at_price_aed >= 0),
  sizes jsonb not null default '[]'::jsonb,
  finishes text[] not null default '{}',
  cover_path text not null,
  gallery_paths text[] not null default '{}',
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','out_of_stock','made_to_order')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_status_created_idx on public.products(status, created_at desc);
create index products_category_status_idx on public.products(category_id, status);
create index products_featured_idx on public.products(is_featured) where status = 'published';
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
create policy "Admins can read their own admin membership"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));
create policy "Anyone can read active categories"
on public.categories for select to anon, authenticated
using (is_active = true or exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Admins can insert categories"
on public.categories for insert to authenticated
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Admins can update categories"
on public.categories for update to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Admins can delete categories"
on public.categories for delete to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Anyone can read published products"
on public.products for select to anon, authenticated
using (status <> 'draft' or exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Admins can insert products"
on public.products for insert to authenticated
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Admins can update products"
on public.products for update to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "Admins can delete products"
on public.products for delete to authenticated
using (exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant select on public.admin_users to authenticated;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('regnar-products', 'regnar-products', true, 12582912, array['image/jpeg','image/png','image/webp']);
create policy "Public can view REGNAR product images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'regnar-products');
create policy "REGNAR admins can upload product images"
on storage.objects for insert to authenticated
with check (bucket_id = 'regnar-products' and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "REGNAR admins can update product images"
on storage.objects for update to authenticated
using (bucket_id = 'regnar-products' and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())))
with check (bucket_id = 'regnar-products' and exists (select 1 from public.admin_users au where au.user_id = (select auth.uid())));
create policy "REGNAR admins can delete product images"
on storage.objects for delete to authenticated
using (bucket_id = 'regnar-products');
insert into public.categories(name_en, name_ar, slug, sort_order) values
 ('Abstract Art','فن تجريدي','abstract-art',1),
 ('Modern Art','فن حديث','modern-art',2),
 ('Nature & Landscape','الطبيعة والمناظر','nature-landscape',3),
 ('Calligraphy','الخط العربي','calligraphy',4);