create table public.user_lesson_locks (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  course_id uuid not null,
  lesson_id uuid not null,
  locked boolean not null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_lesson_locks_pkey primary key (id),
  constraint user_lesson_locks_user_id_lesson_id_key unique (user_id, lesson_id),
  constraint user_lesson_locks_course_id_fkey foreign KEY (course_id) references courses (id),
  constraint user_lesson_locks_lesson_id_fkey foreign KEY (lesson_id) references lessons (id),
  constraint user_lesson_locks_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;