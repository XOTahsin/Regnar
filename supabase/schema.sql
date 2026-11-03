-- REGNAR · complete backend (Supabase / PostgreSQL). Safe to re-run: every statement is idempotent.
-- Run once in Supabase Dashboard → SQL Editor. Never put a service-role key in the website.

-- ───────── Tables ─────────
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  show_on_home boolean not null default true,
  image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.products (
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
  is_top_rated boolean not null default false,
  sales_count integer not null default 0,
  status text not null default 'draft' check (status in ('draft','published','out_of_stock','made_to_order')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.store_settings (
  id text primary key check (id = 'global'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

-- columns that older installs may lack
alter table public.categories add column if not exists show_on_home boolean not null default true;
alter table public.categories add column if not exists image_path text;
alter table public.products add column if not exists is_top_rated boolean not null default false;
alter table public.products add column if not exists sales_count integer not null default 0;
do $$ begin
  if not exists (select 1 from pg_constraint where conname='products_sales_count_nonnegative' and conrelid='public.products'::regclass) then
    alter table public.products add constraint products_sales_count_nonnegative check (sales_count >= 0);
  end if;
end $$;

-- ───────── Indexes ─────────
create index if not exists products_status_created_idx on public.products(status, created_at desc);
create index if not exists products_category_status_idx on public.products(category_id, status);
create index if not exists products_featured_idx on public.products(is_featured) where status = 'published';
create index if not exists categories_active_order_idx on public.categories(is_active, show_on_home, sort_order);
create index if not exists store_settings_updated_by_idx on public.store_settings(updated_by);

-- ───────── updated_at triggers ─────────
create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

-- ───────── Row Level Security ─────────
alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.store_settings enable row level security;

-- admin check used by every policy (security definer so it can read admin_users)
create or replace function public.is_regnar_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admin_users au where au.user_id = (select auth.uid()))
$$;
revoke all on function public.is_regnar_admin() from public;
grant execute on function public.is_regnar_admin() to anon, authenticated;

drop policy if exists "Admins can read their own admin membership" on public.admin_users;
create policy "Admins can read their own admin membership" on public.admin_users for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Anyone can read active categories" on public.categories;
create policy "Anyone can read active categories" on public.categories for select to anon, authenticated using (is_active = true or public.is_regnar_admin());
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories" on public.categories for insert to authenticated with check (public.is_regnar_admin());
drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories" on public.categories for update to authenticated using (public.is_regnar_admin()) with check (public.is_regnar_admin());
drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories" on public.categories for delete to authenticated using (public.is_regnar_admin());

drop policy if exists "Anyone can read published products" on public.products;
create policy "Anyone can read published products" on public.products for select to anon, authenticated using (status <> 'draft' or public.is_regnar_admin());
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products" on public.products for insert to authenticated with check (public.is_regnar_admin());
drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products" on public.products for update to authenticated using (public.is_regnar_admin()) with check (public.is_regnar_admin());
drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products" on public.products for delete to authenticated using (public.is_regnar_admin());

drop policy if exists "Public can read REGNAR storefront settings" on public.store_settings;
create policy "Public can read REGNAR storefront settings" on public.store_settings for select to anon, authenticated using (id = 'global');
drop policy if exists "REGNAR admins can insert storefront settings" on public.store_settings;
create policy "REGNAR admins can insert storefront settings" on public.store_settings for insert to authenticated with check (id = 'global' and public.is_regnar_admin());
drop policy if exists "REGNAR admins can update storefront settings" on public.store_settings;
create policy "REGNAR admins can update storefront settings" on public.store_settings for update to authenticated using (id = 'global' and public.is_regnar_admin()) with check (id = 'global' and public.is_regnar_admin());

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.store_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant insert, update on public.store_settings to authenticated;
grant select on public.admin_users to authenticated;

-- ───────── Storage: public bucket, admin-only writes, 12 MB, JPG/PNG/WEBP ─────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('regnar-products', 'regnar-products', true, 12582912, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 12582912, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view REGNAR product images" on storage.objects;
create policy "Public can view REGNAR product images" on storage.objects for select to anon, authenticated using (bucket_id = 'regnar-products');
drop policy if exists "REGNAR admins can upload product images" on storage.objects;
create policy "REGNAR admins can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'regnar-products' and public.is_regnar_admin());
drop policy if exists "REGNAR admins can update product images" on storage.objects;
create policy "REGNAR admins can update product images" on storage.objects for update to authenticated using (bucket_id = 'regnar-products' and public.is_regnar_admin()) with check (bucket_id = 'regnar-products' and public.is_regnar_admin());
drop policy if exists "REGNAR admins can delete product images" on storage.objects;
create policy "REGNAR admins can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'regnar-products' and public.is_regnar_admin());

-- ───────── Starter data (only inserted when missing; no fake products) ─────────
insert into public.categories(name_en, name_ar, slug, sort_order)
select * from (values
  ('Abstract Art','فن تجريدي','abstract-art',1),
  ('Modern Art','فن حديث','modern-art',2),
  ('Nature & Landscape','الطبيعة والمناظر','nature-landscape',3),
  ('Calligraphy','الخط العربي','calligraphy',4)) v(a,b,c,d)
where not exists (select 1 from public.categories);

insert into public.store_settings (id, content) values ('global', jsonb_build_object(
  'announcement_en','A considered collection of framed art · UAE','announcement_ar','مجموعة مختارة بعناية من اللوحات المؤطرة · الإمارات',
  'hero_kicker_en','The art of personal space','hero_kicker_ar','فن المساحة الشخصية',
  'hero_title_en','Make your walls speak.','hero_title_ar','اجعل جدرانك تروي الحكاية.',
  'hero_subtitle_en','A considered collection of framed art, designed to bring character, calm and intention to the spaces you call your own.','hero_subtitle_ar','مجموعة مختارة بعناية من الأعمال الفنية المؤطرة لتضيف الأناقة والهدوء إلى مساحتك.',
  'hero_note_en','Curated frame art, made to belong','hero_note_ar','فن مؤطر مختار بعناية · صُمّم ليناسب مساحتك',
  'strip_one_en','ART WITH INTENTION','strip_one_ar','فن يحمل معنى','strip_two_en','FRAMES THAT FEEL AT HOME','strip_two_ar','إطارات تشبه منزلك','strip_three_en','YOUR SPACE, YOUR STORY','strip_three_ar','مساحتك، قصتك',
  'categories_title_en','Find your mood.','categories_title_ar','اختر أسلوبك.','categories_subtitle_en','Explore distinctive directions, each chosen to bring a different feeling to your walls.','categories_subtitle_ar','اكتشف تصاميم مميزة تضيف إحساساً مختلفاً إلى جدرانك.',
  'collection_title_en','Pieces with presence.','collection_title_ar','قطع لها حضور.','collection_subtitle_en','Discover framed artwork selected for considered spaces.','collection_subtitle_ar','اكتشف أعمالاً فنية مؤطرة لمساحات أنيقة.',
  'story_title_en','Your space. Your story.','story_title_ar','مساحتك. حكايتك.','story_body_en','A favourite photograph. A place you remember. An artwork that simply feels right. The pieces we live with should mean something — and the way we frame them should honour that.','story_body_ar','صورة تحبها، مكان تتذكره، أو عمل فني يلامس ذوقك. يجب أن تحمل القطع التي نعيش معها معنى.',
  'custom_title_en','A frame of your own.','custom_title_ar','إطار يحمل ذوقك.','custom_body_en','Have a photograph, personal artwork or a specific size in mind? Tell us what you envision.','custom_body_ar','هل لديك صورة أو عمل فني أو مقاس محدد؟ أخبرنا بما تتخيله.',
  'contact_title_en','Found your piece?','contact_title_ar','وجدت قطعتك؟','contact_body_en','Ask about availability, sizing or a custom idea. We are one message away.','contact_body_ar','اسأل عن التوفر أو المقاسات أو فكرة مخصصة. نحن على بُعد رسالة واحدة.',
  'whatsapp_number','8801410158834','instagram_url','https://www.instagram.com/regnar.frame?mdxt=dG1heTY4bDFtdTZk','facebook_url','https://www.facebook.com/share/1JMjC66xXH/',
  'hero_image_path','','show_latest',true,'latest_count',4,
  'latest_title_en','Latest arrivals.','latest_title_ar','أحدث الإضافات.','latest_subtitle_en','The newest additions to the REGNAR collection.','latest_subtitle_ar','أحدث الأعمال التي انضمت إلى مجموعة ريجنار.'))
on conflict (id) do nothing;

-- ───────── Make yourself an admin (run AFTER creating the user in Authentication → Users) ─────────
-- insert into public.admin_users (user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL' on conflict do nothing;
