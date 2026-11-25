begin;

create sequence if not exists public.property_code_seq;

alter table public.properties
  add column if not exists property_code text,
  add column if not exists address text,
  add column if not exists neighborhood text,
  add column if not exists city text,
  add column if not exists province text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_precision text,
  add column if not exists operation_type text,
  add column if not exists property_type text,
  add column if not exists featured boolean not null default false,
  add column if not exists published boolean not null default true,
  add column if not exists bedrooms integer,
  add column if not exists bathrooms integer,
  add column if not exists garages integer,
  add column if not exists covered_area_m2 numeric,
  add column if not exists land_area_m2 numeric,
  add column if not exists display_order integer not null default 0;

update public.properties
set property_code = 'CDO-' || lpad(row_number::text, 3, '0')
from (
  select id, row_number() over (order by created_at nulls last, id) as row_number
  from public.properties
  where property_code is null
) numbered
where public.properties.id = numbered.id;

select setval(
  'public.property_code_seq',
  greatest(coalesce((select max(nullif(regexp_replace(property_code, '\\D', '', 'g'), '')::bigint) from public.properties), 0), 0),
  true
);

alter table public.properties
  alter column property_code set default ('CDO-' || lpad(nextval('public.property_code_seq')::text, 3, '0'));

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'properties_location_precision_check' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint properties_location_precision_check check (location_precision is null or location_precision in ('exact', 'approximate'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'properties_latitude_check' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint properties_latitude_check check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'properties_longitude_check' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint properties_longitude_check check (longitude is null or longitude between -180 and 180);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'properties_bedrooms_check' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint properties_bedrooms_check check (bedrooms is null or bedrooms >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'properties_bathrooms_check' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint properties_bathrooms_check check (bathrooms is null or bathrooms >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'properties_garages_check' and conrelid = 'public.properties'::regclass) then
    alter table public.properties add constraint properties_garages_check check (garages is null or garages >= 0);
  end if;
end $$;

create unique index if not exists properties_property_code_uidx on public.properties (property_code);
create index if not exists properties_published_order_idx on public.properties (published, featured desc, display_order, created_at desc);

alter table public.property_images
  add column if not exists storage_path text,
  add column if not exists is_cover boolean not null default false;

create index if not exists property_images_property_order_idx on public.property_images (property_id, sort_order, created_at);
create unique index if not exists property_images_one_cover_uidx on public.property_images (property_id) where is_cover;

alter table public.property_images enable row level security;

grant select on table public.property_images to anon;
grant select, insert, update, delete on table public.property_images to authenticated;

drop policy if exists "property_images_public_read" on public.property_images;
create policy "property_images_public_read"
  on public.property_images
  for select
  to anon, authenticated
  using (true);

drop policy if exists "property_images_authenticated_insert" on public.property_images;
create policy "property_images_authenticated_insert"
  on public.property_images
  for insert
  to authenticated
  with check (true);

drop policy if exists "property_images_authenticated_update" on public.property_images;
create policy "property_images_authenticated_update"
  on public.property_images
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "property_images_authenticated_delete" on public.property_images;
create policy "property_images_authenticated_delete"
  on public.property_images
  for delete
  to authenticated
  using (true);

commit;
