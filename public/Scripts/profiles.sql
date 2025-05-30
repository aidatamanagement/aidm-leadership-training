create table public.profiles (
  id uuid not null,
  name text not null,
  email text not null,
  role text not null default 'student'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_email_key unique (email),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_role_check check (
    (
      role = any (array['admin'::text, 'student'::text])
    )
  )
) TABLESPACE pg_default;