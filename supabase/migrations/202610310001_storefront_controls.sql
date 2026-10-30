-- REGNAR storefront controls and category merchandising.
-- This migration was executed on the dedicated REGNAR project after reviewing its live schema.

alter table public.categories
  add column if not exists show_on_home boolean not null default true;

create index if not exists categories_active_order_idx
  on public.categories (is_active, show_on_home, sort_order);

create table if not exists public.store_settings (
  id text primary key check (id = 'global'),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.store_settings enable row level security;

create policy "Public can read REGNAR storefront settings"
on public.store_settings for select to anon, authenticated
using (id = 'global');

create policy "REGNAR admins can update storefront settings"
on public.store_settings for update to authenticated
using (id = 'global' and exists (
  select 1 from public.admin_users au where au.user_id = (select auth.uid())
))
with check (id = 'global' and exists (
  select 1 from public.admin_users au where au.user_id = (select auth.uid())
));

create policy "REGNAR admins can insert storefront settings"
on public.store_settings for insert to authenticated
with check (id = 'global' and exists (
  select 1 from public.admin_users au where au.user_id = (select auth.uid())
));

grant select on public.store_settings to anon, authenticated;
grant insert, update on public.store_settings to authenticated;

insert into public.store_settings (id, content)
values (
 'global',
 jsonb_build_object(
  'announcement_en','A considered collection of framed art · UAE',
  'announcement_ar','مجموعة مختارة بعناية من اللوحات المؤطرة · الإمارات',
  'hero_kicker_en','THE ART OF PERSONAL SPACE',
  'hero_kicker_ar','فن المساحة الشخصية',
  'hero_title_en','Make your walls speak.',
  'hero_title_ar','اجعل جدرانك تروي الحكاية.',
  'hero_subtitle_en','A considered collection of framed art, designed to bring character, calm and intention to the spaces you call your own.',
  'hero_subtitle_ar','مجموعة مختارة بعناية من الأعمال الفنية المؤطرة لتضيف الأناقة والهدوء إلى مساحتك.',
  'hero_note_en','CURATED FRAME ART · MADE TO BELONG',
  'hero_note_ar','فن مؤطر مختار بعناية · صُمّم ليناسب مساحتك',
  'strip_one_en','ART WITH INTENTION','strip_one_ar','فن يحمل معنى',
  'strip_two_en','FRAMES THAT FEEL AT HOME','strip_two_ar','إطارات تشبه منزلك',
  'strip_three_en','YOUR SPACE, YOUR STORY','strip_three_ar','مساحتك، قصتك',
  'categories_title_en','Find your mood.','categories_title_ar','اختر أسلوبك.',
  'categories_subtitle_en','Explore distinctive directions, each chosen to bring a different feeling to your walls.',
  'categories_subtitle_ar','اكتشف تصاميم مميزة تضيف إحساساً مختلفاً إلى جدرانك.',
  'collection_title_en','Pieces with presence.','collection_title_ar','قطع لها حضور.',
  'collection_subtitle_en','Discover framed artwork selected for considered spaces.',
  'collection_subtitle_ar','اكتشف أعمالاً فنية مؤطرة لمساحات أنيقة.',
  'story_title_en','Your space. Your story.','story_title_ar','مساحتك. حكايتك.',
  'story_body_en','A favourite photograph. A place you remember. An artwork that simply feels right. The pieces we live with should mean something — and the way we frame them should honour that.',
  'story_body_ar','صورة تحبها، مكان تتذكره، أو عمل فني يلامس ذوقك. يجب أن تحمل القطع التي نعيش معها معنى.',
  'custom_title_en','A frame of your own.','custom_title_ar','إطار يحمل ذوقك.',
  'custom_body_en','Have a photograph, personal artwork or a specific size in mind? Tell us what you envision.',
  'custom_body_ar','هل لديك صورة أو عمل فني أو مقاس محدد؟ أخبرنا بما تتخيله.',
  'contact_title_en','Found your piece?','contact_title_ar','وجدت قطعتك؟',
  'contact_body_en','Ask about availability, sizing or a custom idea. We are one message away.',
  'contact_body_ar','اسأل عن التوفر أو المقاسات أو فكرة مخصصة. نحن على بُعد رسالة واحدة.',
  'whatsapp_number','8801410158834',
  'instagram_url','https://www.instagram.com/regnar.frame?mdxt=dG1heTY4bDFtdTZk',
  'facebook_url','https://www.facebook.com/share/1JMjC66xXH/',
  'hero_image_path','',
  'show_latest',true,
  'latest_count',4
 )
)
on conflict (id) do nothing;
