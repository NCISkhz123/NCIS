-- 1. Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, full_name, app_role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Pengguna Baru'),
    'USER' -- default role
  );
  
  -- also make sure the auth metadata matches the default role
  update auth.users
  set raw_user_meta_data = jsonb_set(
    coalesce(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"USER"'
  )
  where id = new.id;

  return new;
end;
$$;

-- Trigger for new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Function to sync app_role from profiles to auth.users metadata
create or replace function public.sync_profile_role_to_auth()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Only update if the role has actually changed
  if new.app_role is distinct from old.app_role then
    update auth.users
    set raw_user_meta_data = jsonb_set(
      coalesce(raw_user_meta_data, '{}'::jsonb),
      '{role}',
      to_jsonb(new.app_role::text)
    )
    where id = new.user_id;
  end if;
  return new;
end;
$$;

-- Trigger to sync role when profile is updated
drop trigger if exists sync_role_on_profile_update on public.profiles;
create trigger sync_role_on_profile_update
  after update of app_role on public.profiles
  for each row execute procedure public.sync_profile_role_to_auth();
