do $$
begin
  if exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'app_role'
  ) then
    if not exists (
      select 1
      from pg_enum
      where enumtypid = 'public.app_role'::regtype
        and enumlabel = 'KEPALA_SEKSI'
    ) then
      alter type public.app_role add value 'KEPALA_SEKSI';
    end if;
  end if;
end
$$;

create or replace function public.is_laundry_role()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('ADMIN_LAUNDRY', 'PETUGAS_LAUNDRY', 'KEPALA_SEKSI');
$$;

create or replace function public.is_cssd_role()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in ('ADMIN_CSSD', 'PETUGAS_CSSD', 'KEPALA_SEKSI');
$$;

create or replace function public.is_ncis_module_role()
returns boolean
language sql
stable
as $$
  select public.current_app_role() in (
    'ADMIN_CSSD',
    'PETUGAS_CSSD',
    'ADMIN_LAUNDRY',
    'PETUGAS_LAUNDRY',
    'KEPALA_SEKSI'
  );
$$;
