create table public.lesson_locks (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  course_id uuid not null,
  lesson_id uuid not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint lesson_locks_pkey primary key (id),
  constraint lesson_locks_user_id_course_id_lesson_id_key unique (user_id, course_id, lesson_id),
  constraint lesson_locks_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint lesson_locks_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint lesson_locks_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_lesson_locks_user_course on public.lesson_locks using btree (user_id, course_id) TABLESPACE pg_default;