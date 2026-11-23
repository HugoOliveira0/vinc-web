create table public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  theme text not null default 'system'
    check (theme in ('system', 'light', 'dark', 'contrast')),
  text_scale text not null default 'normal'
    check (text_scale in ('normal', 'large', 'extra-large')),
  reduce_motion boolean not null default false,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.user_preferences enable row level security;

revoke all on table public.user_preferences from anon;
grant select, insert, update, delete
  on table public.user_preferences
  to authenticated;

create policy "Users can read their own preferences"
  on public.user_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own preferences"
  on public.user_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own preferences"
  on public.user_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own preferences"
  on public.user_preferences
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
