create table public.quiz_settings (
  id uuid not null default gen_random_uuid (),
  pass_mark_percentage integer not null default 70,
  enforce_pass_mark boolean not null default true,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint quiz_settings_pkey primary key (id)
) TABLESPACE pg_default;