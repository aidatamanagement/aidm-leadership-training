create table public.prompts (
  id serial not null,
  title text not null,
  context text not null,
  role text not null,
  interview text null,
  task text not null,
  boundaries text null,
  reasoning text null,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint prompts_pkey primary key (id)
) TABLESPACE pg_default;