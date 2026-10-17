begin;

create table if not exists public.site_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text,
  content text,
  image_url text,
  video_url text,
  category text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists site_posts_status_order_idx on public.site_posts (status, display_order, published_at desc);

alter table public.site_posts enable row level security;
grant select on table public.site_posts to anon;
grant select, insert, update, delete on table public.site_posts to authenticated;

drop policy if exists "site_posts_public_read" on public.site_posts;
create policy "site_posts_public_read" on public.site_posts for select to anon, authenticated using (status = 'published' or (select auth.uid()) is not null);

drop policy if exists "site_posts_authenticated_insert" on public.site_posts;
create policy "site_posts_authenticated_insert" on public.site_posts for insert to authenticated with check (true);

drop policy if exists "site_posts_authenticated_update" on public.site_posts;
create policy "site_posts_authenticated_update" on public.site_posts for update to authenticated using (true) with check (true);

drop policy if exists "site_posts_authenticated_delete" on public.site_posts;
create policy "site_posts_authenticated_delete" on public.site_posts for delete to authenticated using (true);

commit;
