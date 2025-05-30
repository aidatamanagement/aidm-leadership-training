create table public.services (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text null,
  type text not null,
  status text null default 'active'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint services_pkey primary key (id),
  constraint services_status_check check (
    (
      status = any (array['active'::text, 'inactive'::text])
    )
  ),
  constraint services_type_check check (
    (
      type = any (
        array[
          'course'::text,
          'framework'::text,
          'transformation'::text,
          'architecture'::text,
          'advisory'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_services_updated_at BEFORE
update on services for EACH row
execute FUNCTION update_updated_at_column ();