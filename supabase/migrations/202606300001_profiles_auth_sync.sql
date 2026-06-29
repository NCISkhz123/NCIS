drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.profile_role_for_uid(target_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select app_role::text
      from public.profiles
      where user_id = target_user_id
        and is_active = true
      limit 1
    ),
    'USER'
  );
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
as $$
  select coalesce(
    public.profile_role_for_uid(auth.uid()),
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'USER'
  );
$$;
