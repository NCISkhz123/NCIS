insert into public.profiles (user_id, email, full_name, app_role)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'admin.cssd@ncis.local',
    'Admin CSSD',
    'ADMIN_CSSD'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'petugas.cssd@ncis.local',
    'Petugas CSSD',
    'PETUGAS_CSSD'
  )
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  app_role = excluded.app_role,
  is_active = true;

insert into public.units_of_measure (code, name)
values
  ('PCS', 'Pieces'),
  ('SET', 'Set'),
  ('BOTOL', 'Botol')
on conflict (code) do update
set
  name = excluded.name,
  is_active = true;

insert into public.hospital_units (code, name)
values
  ('OK', 'Kamar Operasi'),
  ('ICU', 'Intensive Care Unit'),
  ('RAWAT-INAP', 'Rawat Inap')
on conflict (code) do update
set
  name = excluded.name,
  is_active = true;
