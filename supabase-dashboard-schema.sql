alter table public.profiles
  add column if not exists phone text;

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  species text not null check (species in ('Dog', 'Cat', 'Other')),
  breed text check (breed is null or char_length(breed) <= 100),
  date_of_birth date,
  gender text check (gender is null or gender in ('Male', 'Female', 'Unknown')),
  weight numeric(7, 2) check (weight is null or weight > 0),
  photo_path text,
  allergies text,
  medical_conditions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, id)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  contact_name text not null check (char_length(btrim(contact_name)) between 1 and 120),
  contact_email text not null check (char_length(btrim(contact_email)) <= 320),
  contact_phone text check (contact_phone is null or char_length(btrim(contact_phone)) between 7 and 40),
  pet_name text not null check (char_length(btrim(pet_name)) between 1 and 80),
  pet_species text check (pet_species is null or pet_species in ('Dog', 'Cat', 'Other')),
  pet_breed text,
  service text not null check (char_length(btrim(service)) between 1 and 120),
  preferred_veterinarian text,
  appointment_date date not null,
  appointment_time time not null,
  notes text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  cancellation_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  consultation_date date not null,
  reason_for_visit text not null,
  diagnosis text,
  treatment text,
  medication text,
  veterinarian_notes text,
  weight_recorded numeric(7, 2) check (weight_recorded is null or weight_recorded > 0),
  record_source text not null default 'clinic'
    check (record_source in ('clinic', 'owner')),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vaccinations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  pet_id uuid references public.pets (id) on delete set null,
  vaccine_name text not null check (char_length(btrim(vaccine_name)) between 1 and 120),
  administered_on date not null,
  next_due_date date,
  veterinarian text,
  owner_provided boolean not null default true,
  verified_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_owner_created_idx
  on public.pets (owner_id, created_at desc);
create index if not exists appointments_owner_date_idx
  on public.appointments (owner_id, appointment_date, appointment_time);
create index if not exists health_records_owner_date_idx
  on public.health_records (owner_id, consultation_date desc);
create index if not exists vaccinations_owner_due_idx
  on public.vaccinations (owner_id, next_due_date);

alter table public.pets enable row level security;
alter table public.appointments enable row level security;
alter table public.health_records enable row level security;
alter table public.vaccinations enable row level security;

revoke all on table public.pets from public, anon, authenticated;
grant select, delete on table public.pets to authenticated;
grant insert (
  owner_id, name, species, breed, date_of_birth, gender, weight, photo_path,
  allergies, medical_conditions, notes
) on public.pets to authenticated;
grant update (
  name, species, breed, date_of_birth, gender, weight, photo_path,
  allergies, medical_conditions, notes
) on public.pets to authenticated;

drop policy if exists "Owners can view their pets" on public.pets;
create policy "Owners can view their pets"
  on public.pets for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can add their pets" on public.pets;
create policy "Owners can add their pets"
  on public.pets for insert to authenticated
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update their pets" on public.pets;
create policy "Owners can update their pets"
  on public.pets for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete their pets" on public.pets;
create policy "Owners can delete their pets"
  on public.pets for delete to authenticated
  using ((select auth.uid()) = owner_id);

revoke all on table public.appointments from public, anon, authenticated;
grant select on table public.appointments to authenticated;
grant insert (
  owner_id, pet_id, contact_name, contact_email, contact_phone, pet_name,
  pet_species, pet_breed, service, preferred_veterinarian, appointment_date,
  appointment_time, notes
) on public.appointments to anon, authenticated;
grant update (cancellation_requested_at) on public.appointments to authenticated;

drop policy if exists "Owners can view their appointments" on public.appointments;
create policy "Owners can view their appointments"
  on public.appointments for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can request appointments" on public.appointments;
create policy "Owners can request appointments"
  on public.appointments for insert to authenticated
  with check ((select auth.uid()) = owner_id and status = 'pending');

drop policy if exists "Guests can submit appointment requests" on public.appointments;
create policy "Guests can submit appointment requests"
  on public.appointments for insert to anon
  with check (owner_id is null and status = 'pending');

drop policy if exists "Owners can request appointment cancellation" on public.appointments;
create policy "Owners can request appointment cancellation"
  on public.appointments for update to authenticated
  using (
    (select auth.uid()) = owner_id
    and status in ('pending', 'confirmed')
    and cancellation_requested_at is null
  )
  with check (
    (select auth.uid()) = owner_id
    and status in ('pending', 'confirmed')
    and cancellation_requested_at is not null
  );

revoke all on table public.health_records from public, anon, authenticated;
grant select on table public.health_records to authenticated;

drop policy if exists "Owners can read their health records" on public.health_records;
create policy "Owners can read their health records"
  on public.health_records for select to authenticated
  using ((select auth.uid()) = owner_id);

revoke all on table public.vaccinations from public, anon, authenticated;
grant select on table public.vaccinations to authenticated;
grant insert (
  owner_id, pet_id, vaccine_name, administered_on, next_due_date, veterinarian
) on public.vaccinations to authenticated;
grant update (
  pet_id, vaccine_name, administered_on, next_due_date, veterinarian
) on public.vaccinations to authenticated;
grant delete on public.vaccinations to authenticated;

drop policy if exists "Owners can read their vaccinations" on public.vaccinations;
create policy "Owners can read their vaccinations"
  on public.vaccinations for select to authenticated
  using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can add unverified vaccinations" on public.vaccinations;
create policy "Owners can add unverified vaccinations"
  on public.vaccinations for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and owner_provided
    and verified_by is null
  );

drop policy if exists "Owners can update unverified vaccinations" on public.vaccinations;
create policy "Owners can update unverified vaccinations"
  on public.vaccinations for update to authenticated
  using ((select auth.uid()) = owner_id and owner_provided)
  with check ((select auth.uid()) = owner_id and owner_provided);

drop policy if exists "Owners can delete unverified vaccinations" on public.vaccinations;
create policy "Owners can delete unverified vaccinations"
  on public.vaccinations for delete to authenticated
  using ((select auth.uid()) = owner_id and owner_provided);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists pets_touch_updated_at on public.pets;
create trigger pets_touch_updated_at
  before update on public.pets
  for each row execute procedure public.touch_updated_at();

drop trigger if exists appointments_touch_updated_at on public.appointments;
create trigger appointments_touch_updated_at
  before update on public.appointments
  for each row execute procedure public.touch_updated_at();

drop trigger if exists health_records_touch_updated_at on public.health_records;
create trigger health_records_touch_updated_at
  before update on public.health_records
  for each row execute procedure public.touch_updated_at();

drop trigger if exists vaccinations_touch_updated_at on public.vaccinations;
create trigger vaccinations_touch_updated_at
  before update on public.vaccinations
  for each row execute procedure public.touch_updated_at();

create or replace function public.ensure_pet_belongs_to_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.pet_id is not null and not exists (
    select 1
    from public.pets
    where id = new.pet_id
      and owner_id = new.owner_id
  ) then
    raise exception 'The selected pet does not belong to this account';
  end if;
  return new;
end;
$$;

revoke all on function public.ensure_pet_belongs_to_owner() from public, anon, authenticated;

drop trigger if exists appointments_validate_pet_owner on public.appointments;
create trigger appointments_validate_pet_owner
  before insert or update of pet_id, owner_id on public.appointments
  for each row execute procedure public.ensure_pet_belongs_to_owner();

drop trigger if exists health_records_validate_pet_owner on public.health_records;
create trigger health_records_validate_pet_owner
  before insert or update of pet_id, owner_id on public.health_records
  for each row execute procedure public.ensure_pet_belongs_to_owner();

drop trigger if exists vaccinations_validate_pet_owner on public.vaccinations;
create trigger vaccinations_validate_pet_owner
  before insert or update of pet_id, owner_id on public.vaccinations
  for each row execute procedure public.ensure_pet_belongs_to_owner();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pet-photos',
  'pet-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Owners can view their pet photos" on storage.objects;
create policy "Owners can view their pet photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owners can upload their pet photos" on storage.objects;
create policy "Owners can upload their pet photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owners can update their pet photos" on storage.objects;
create policy "Owners can update their pet photos"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Owners can delete their pet photos" on storage.objects;
create policy "Owners can delete their pet photos"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'pet-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
