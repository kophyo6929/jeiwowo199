-- Ensure has_role helper exists
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

-- Ensure the specific admin user has the admin role (idempotent)
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'thewayofthedragg@gmail.com'
on conflict (user_id, role) do nothing;

-- Create or replace the function to auto-assign admin on signup for this email
create or replace function public.handle_admin_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'thewayofthedragg@gmail.com' then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin'::public.app_role)
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

-- Recreate trigger to ensure it's attached
drop trigger if exists on_auth_user_created_admin on auth.users;
create trigger on_auth_user_created_admin
  after insert on auth.users
  for each row execute function public.handle_admin_signup();