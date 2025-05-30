create table public.lessons (
  id uuid not null default gen_random_uuid (),
  course_id uuid null,
  title text not null,
  description text not null,
  pdf_url text not null,
  instructor_notes text not null,
  quiz_set_id uuid null,
  "order" integer not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint lessons_pkey primary key (id),
  constraint lessons_course_id_fkey foreign KEY (course_id) references courses (id) on delete CASCADE,
  constraint lessons_quiz_set_id_fkey foreign KEY (quiz_set_id) references quiz_sets (id) on delete set null
) TABLESPACE pg_default;