create table public.user_services (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  service_id uuid null,
  assigned_at timestamp with time zone not null default timezone ('utc'::text, now()),
  status text null default 'active'::text,
  constraint user_services_pkey primary key (id),
  constraint user_services_user_id_service_id_key unique (user_id, service_id),
  constraint user_services_service_id_fkey foreign KEY (service_id) references services (id) on delete CASCADE,
  constraint user_services_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint user_services_status_check check (
    (
      status = any (array['active'::text, 'inactive'::text])
    )
  )
) TABLESPACE pg_default;