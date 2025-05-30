create table public.user_course_assignments (
  id uuid not null default gen_random_uuid (),
  user_id uuid null,
  course_id uuid null,
  locked boolean not null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_course_assignments_pkey primary key (id),
  constraint user_course_assignments_user_id_course_id_key unique (user_id, course_id),
  constraint user_course_assignments_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint user_course_assignments_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;