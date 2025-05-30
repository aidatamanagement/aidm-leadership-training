create table public.courses (
  id uuid not null default gen_random_uuid (),
  title text not null,
  description text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint courses_pkey primary key (id)
) TABLESPACE pg_default;