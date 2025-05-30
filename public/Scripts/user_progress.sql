create table public.user_progress (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  lesson_id uuid null,
  completed boolean not null default false,
  time_spent integer not null default 0,
  pdf_viewed boolean not null default false,
  quiz_score integer null,
  quiz_attempts integer not null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_progress_pkey primary key (id),
  constraint user_progress_user_id_lesson_id_key unique (user_id, lesson_id),
  constraint user_progress_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint user_progress_lesson_id_fkey foreign KEY (lesson_id) references lessons (id) on delete CASCADE,
  constraint user_progress_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;