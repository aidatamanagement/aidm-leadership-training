create table public.quiz_sets (
  id uuid not null default gen_random_uuid (),
  title text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint quiz_sets_pkey primary key (id)
) TABLESPACE pg_default;