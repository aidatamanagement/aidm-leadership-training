create table public.quiz_questions (
  id uuid not null default gen_random_uuid (),
  quiz_set_id uuid null,
  question text not null,
  options jsonb not null,
  correct_answer integer not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint quiz_questions_pkey primary key (id),
  constraint quiz_questions_quiz_set_id_fkey foreign KEY (quiz_set_id) references quiz_sets (id) on delete CASCADE
) TABLESPACE pg_default;