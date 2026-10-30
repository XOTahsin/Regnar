-- REGNAR category photography and merchandising controls
alter table public.categories add column if not exists image_path text;
alter table public.products
  add column if not exists is_top_rated boolean not null default false,
  add column if not exists sales_count integer not null default 0;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'products_sales_count_nonnegative'
      and conrelid = 'public.products'::regclass
  ) then
    alter table public.products
      add constraint products_sales_count_nonnegative check (sales_count >= 0);
  end if;
end $$;
