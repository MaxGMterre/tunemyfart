-- Schéma Supabase pour Tunemyfart / l'Anal-yser
-- À exécuter dans l'éditeur SQL de ton projet Supabase

create extension if not exists "uuid-ossp";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  ville text,
  region text,
  pays text,
  communaute_id uuid,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists recordings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  audio_url text,
  db_max numeric,
  db_avg numeric,
  note_principale text,
  sequence_notes jsonb default '[]',
  duree_ms integer,
  waveform_data jsonb default '[]',
  alimentation text,
  lieu text,
  odeur text,
  tags text[]
);

create index if not exists idx_recordings_db_max on recordings (db_max desc);
create index if not exists idx_recordings_duree on recordings (duree_ms desc);
create index if not exists idx_recordings_user on recordings (user_id);
create index if not exists idx_recordings_created on recordings (created_at desc);

-- Vue de classement : le plus fort, toutes périodes
create or replace view leaderboard_plus_fort as
select r.id, r.user_id, p.username, p.ville, p.region, p.pays, r.db_max, r.created_at
from recordings r
join profiles p on p.id = r.user_id
order by r.db_max desc;

-- Vue de classement : la mélodie la plus longue
create or replace view leaderboard_plus_long as
select r.id, r.user_id, p.username, p.ville, p.region, p.pays, r.duree_ms, r.created_at
from recordings r
join profiles p on p.id = r.user_id
order by r.duree_ms desc;

-- Row Level Security : chacun lit tout (classements publics), mais ne modifie que ses propres enregistrements
alter table recordings enable row level security;
alter table profiles enable row level security;

create policy "Lecture publique des enregistrements" on recordings for select using (true);
create policy "Ecriture de ses propres enregistrements" on recordings for insert with check (auth.uid() = user_id);
create policy "Modification de ses propres enregistrements" on recordings for update using (auth.uid() = user_id);

create policy "Lecture publique des profils" on profiles for select using (true);
create policy "Ecriture de son propre profil" on profiles for insert with check (auth.uid() = id);
create policy "Modification de son propre profil" on profiles for update using (auth.uid() = id);

-- Missions (V2, structure posée dès maintenant)
create table if not exists missions (
  id uuid primary key default uuid_generate_v4(),
  titre text not null,
  description text,
  condition jsonb,
  recompense text
);

create table if not exists user_missions (
  user_id uuid references profiles(id) on delete cascade,
  mission_id uuid references missions(id) on delete cascade,
  progres jsonb default '{}',
  completed_at timestamptz,
  primary key (user_id, mission_id)
);
