create table public.favorites (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  prompt_id integer not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint favorites_pkey primary key (id),
  constraint favorites_user_id_prompt_id_key unique (user_id, prompt_id),
  constraint favorites_prompt_id_fkey foreign KEY (prompt_id) references prompts (id) on delete CASCADE,
  constraint favorites_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists favorites_user_id_idx on public.favorites using btree (user_id) TABLESPACE pg_default;

create index IF not exists favorites_prompt_id_idx on public.favorites using btree (prompt_id) TABLESPACE pg_default;