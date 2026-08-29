-- ============ PROFILES ============
alter table public.profiles
  add column if not exists banned boolean not null default false,
  add column if not exists banned_at timestamptz,
  add column if not exists ban_reason text;

-- ============ ROLES ============
create type public.app_role as enum ('super_admin','admin','editor');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create or replace function public.can_manage_users(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('super_admin','admin'))
$$;

create or replace function public.is_banned(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select banned from public.profiles where id = _user_id), false)
$$;

create policy "Users can view own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_staff(auth.uid()));
create policy "Super admin manages roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(),'super_admin'))
  with check (public.has_role(auth.uid(),'super_admin'));

create policy "Staff can view all profiles" on public.profiles
  for select to authenticated using (public.is_staff(auth.uid()));
create policy "Admins can update profiles" on public.profiles
  for update to authenticated using (public.can_manage_users(auth.uid()))
  with check (public.can_manage_users(auth.uid()));

-- ============ CATEGORIES ============
create table public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.course_categories to anon, authenticated;
grant all on public.course_categories to service_role;
alter table public.course_categories enable row level security;
create policy "Categories are public" on public.course_categories for select using (true);
create policy "Staff manage categories" on public.course_categories
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

insert into public.course_categories (name, slug) values
  ('Tecnologia','tecnologia'),('Administração','administracao'),('Empreendedorismo','empreendedorismo'),
  ('Carreira e Emprego','carreira-e-emprego'),('Direito','direito'),('Finanças','financas'),
  ('Design','design'),('Outros','outros');

-- ============ COURSES ============
create type public.course_level as enum ('iniciante','intermediario','avancado');
create type public.publish_status as enum ('rascunho','publicado');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null default '',
  cover_url text,
  category_id uuid references public.course_categories(id) on delete set null,
  level public.course_level not null default 'iniciante',
  hours numeric not null default 0,
  instructor text not null default 'ConectAção',
  status public.publish_status not null default 'rascunho',
  is_external boolean not null default false,
  platform text,
  external_url text,
  views_count integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;
grant all on public.courses to service_role;
alter table public.courses enable row level security;
create policy "Published courses are public" on public.courses
  for select using (status = 'publicado' or public.is_staff(auth.uid()));
create policy "Staff create courses" on public.courses
  for insert to authenticated with check (public.is_staff(auth.uid()));
create policy "Staff update courses" on public.courses
  for update to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create policy "Super admin deletes courses" on public.courses
  for delete to authenticated using (public.has_role(auth.uid(),'super_admin'));
create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

-- ============ LESSONS ============
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  content text not null default '',
  video_url text,
  position integer not null default 1,
  duration_min integer not null default 10,
  required boolean not null default true,
  status public.publish_status not null default 'publicado',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.lessons to anon, authenticated;
grant insert, update, delete on public.lessons to authenticated;
grant all on public.lessons to service_role;
alter table public.lessons enable row level security;
create policy "Lessons of published courses are public" on public.lessons
  for select using (
    public.is_staff(auth.uid())
    or exists (select 1 from public.courses c where c.id = course_id and c.status = 'publicado')
  );
create policy "Staff manage lessons" on public.lessons
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

-- ============ ENROLLMENTS ============
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  progress integer not null default 0,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);
grant select, insert, update, delete on public.enrollments to authenticated;
grant all on public.enrollments to service_role;
alter table public.enrollments enable row level security;
create policy "Users manage own enrollments" on public.enrollments
  for all to authenticated
  using (user_id = auth.uid() and not public.is_banned(auth.uid()))
  with check (user_id = auth.uid() and not public.is_banned(auth.uid()));
create policy "Staff view enrollments" on public.enrollments
  for select to authenticated using (public.is_staff(auth.uid()));
create trigger enrollments_updated_at before update on public.enrollments
  for each row execute function public.set_updated_at();

-- ============ LESSON PROGRESS ============
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
grant select, insert, delete on public.lesson_progress to authenticated;
grant all on public.lesson_progress to service_role;
alter table public.lesson_progress enable row level security;
create policy "Users manage own lesson progress" on public.lesson_progress
  for all to authenticated
  using (user_id = auth.uid() and not public.is_banned(auth.uid()))
  with check (user_id = auth.uid() and not public.is_banned(auth.uid()));
create policy "Staff view lesson progress" on public.lesson_progress
  for select to authenticated using (public.is_staff(auth.uid()));

create or replace function public.recalc_progress()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _user uuid := coalesce(new.user_id, old.user_id);
  _course uuid := coalesce(new.course_id, old.course_id);
  _total int;
  _done int;
  _pct int;
begin
  select count(*) into _total from public.lessons
    where course_id = _course and required and status = 'publicado';
  select count(*) into _done from public.lesson_progress lp
    join public.lessons l on l.id = lp.lesson_id
    where lp.user_id = _user and l.course_id = _course and l.required and l.status = 'publicado';
  _pct := case when _total = 0 then 0 else round((_done::numeric / _total) * 100) end;
  insert into public.enrollments (user_id, course_id, progress, completed_at)
  values (_user, _course, _pct, case when _pct >= 100 then now() else null end)
  on conflict (user_id, course_id) do update
    set progress = _pct,
        completed_at = case when _pct >= 100 then coalesce(public.enrollments.completed_at, now()) else null end,
        updated_at = now();
  return null;
end; $$;

create trigger lesson_progress_recalc
  after insert or delete on public.lesson_progress
  for each row execute function public.recalc_progress();

-- ============ CERTIFICATES ============
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  code text not null unique,
  student_name text not null,
  course_name text not null,
  hours numeric not null default 0,
  issued_at timestamptz not null default now(),
  unique (user_id, course_id)
);
grant select on public.certificates to authenticated;
grant all on public.certificates to service_role;
alter table public.certificates enable row level security;
create policy "Users view own certificates" on public.certificates
  for select to authenticated using (user_id = auth.uid());
create policy "Staff view certificates" on public.certificates
  for select to authenticated using (public.is_staff(auth.uid()));

create or replace function public.issue_certificate(_course_id uuid)
returns public.certificates language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _cert public.certificates;
  _course public.courses;
  _name text;
  _progress int;
begin
  if _uid is null then raise exception 'Não autenticado'; end if;
  if public.is_banned(_uid) then raise exception 'Conta banida'; end if;

  select * into _course from public.courses where id = _course_id;
  if _course.id is null then raise exception 'Curso não encontrado'; end if;
  if _course.is_external then raise exception 'Cursos externos não emitem certificado'; end if;

  select progress into _progress from public.enrollments where user_id = _uid and course_id = _course_id;
  if coalesce(_progress,0) < 100 then raise exception 'Curso não concluído'; end if;

  select * into _cert from public.certificates where user_id = _uid and course_id = _course_id;
  if _cert.id is not null then return _cert; end if;

  select coalesce(nullif(full_name,''), email) into _name from public.profiles where id = _uid;

  insert into public.certificates (user_id, course_id, code, student_name, course_name, hours)
  values (_uid, _course_id, 'CA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
          coalesce(_name,'Aluno'), _course.title, _course.hours)
  returning * into _cert;
  return _cert;
end; $$;

grant execute on function public.issue_certificate(uuid) to authenticated;

create or replace function public.verify_certificate(_code text)
returns table (code text, student_name text, course_name text, hours numeric, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.code, c.student_name, c.course_name, c.hours, c.issued_at
  from public.certificates c where c.code = upper(trim(_code))
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;

create or replace function public.admin_stats()
returns json language plpgsql stable security definer set search_path = public as $$
declare result json;
begin
  if not public.is_staff(auth.uid()) then raise exception 'Acesso negado'; end if;
  select json_build_object(
    'total_users', (select count(*) from public.profiles),
    'active_users', (select count(*) from public.profiles where not banned),
    'banned_users', (select count(*) from public.profiles where banned),
    'total_courses', (select count(*) from public.courses),
    'own_courses', (select count(*) from public.courses where not is_external),
    'external_courses', (select count(*) from public.courses where is_external),
    'started_courses', (select count(*) from public.enrollments),
    'completed_courses', (select count(*) from public.enrollments where completed_at is not null),
    'certificates', (select count(*) from public.certificates)
  ) into result;
  return result;
end; $$;
grant execute on function public.admin_stats() to authenticated;

create or replace function public.increment_course_views(_course_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.courses set views_count = views_count + 1 where id = _course_id and status = 'publicado';
$$;
grant execute on function public.increment_course_views(uuid) to anon, authenticated;