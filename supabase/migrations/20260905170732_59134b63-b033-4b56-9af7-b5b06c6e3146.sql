-- 1. Status padrão de conteúdo
create type public.content_status as enum ('rascunho','publicado','desativado','arquivado');

-- courses.status / lessons.status passam a usar o novo tipo
drop policy if exists "Published courses are public" on public.courses;
drop policy if exists "Lessons of published courses are public" on public.lessons;

alter table public.courses alter column status drop default;
alter table public.courses alter column status type public.content_status using status::text::public.content_status;
alter table public.courses alter column status set default 'rascunho';

alter table public.lessons alter column status drop default;
alter table public.lessons alter column status type public.content_status using status::text::public.content_status;
alter table public.lessons alter column status set default 'publicado';

create policy "Published courses are public" on public.courses
  for select using (status = 'publicado'::public.content_status or public.is_staff(auth.uid()));

create policy "Lessons of published courses are public" on public.lessons
  for select using (
    public.is_staff(auth.uid()) or exists (
      select 1 from public.courses c
      where c.id = lessons.course_id and c.status = 'publicado'::public.content_status
    )
  );

-- 2. Categorias genéricas
create table public.content_categories (
  id uuid primary key default gen_random_uuid(),
  scope text not null default 'curso',
  parent_id uuid references public.content_categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text not null default '',
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scope, slug)
);
grant select on public.content_categories to anon;
grant select, insert, update, delete on public.content_categories to authenticated;
grant all on public.content_categories to service_role;
alter table public.content_categories enable row level security;
create policy "Categorias ativas sao publicas" on public.content_categories
  for select using (active or public.is_staff(auth.uid()));
create policy "Staff gerencia categorias" on public.content_categories
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger content_categories_updated_at before update on public.content_categories
  for each row execute function public.set_updated_at();

-- 3. Etiquetas
create table public.content_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  active boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.content_tags to anon;
grant select, insert, update, delete on public.content_tags to authenticated;
grant all on public.content_tags to service_role;
alter table public.content_tags enable row level security;
create policy "Tags ativas sao publicas" on public.content_tags
  for select using (active or public.is_staff(auth.uid()));
create policy "Staff gerencia tags" on public.content_tags
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger content_tags_updated_at before update on public.content_tags
  for each row execute function public.set_updated_at();

-- 4. Modelos de certificado
create table public.certificate_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  file_url text,
  file_type text not null default 'png',
  active boolean not null default true,
  is_default boolean not null default false,
  fields jsonb not null default '{}'::jsonb,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.certificate_templates to anon;
grant select, insert, update, delete on public.certificate_templates to authenticated;
grant all on public.certificate_templates to service_role;
alter table public.certificate_templates enable row level security;
create policy "Modelos ativos sao publicos" on public.certificate_templates
  for select using (active or public.is_staff(auth.uid()));
create policy "Staff gerencia modelos de certificado" on public.certificate_templates
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger certificate_templates_updated_at before update on public.certificate_templates
  for each row execute function public.set_updated_at();

-- 5. Cursos: novos campos
alter table public.courses
  add column subtitle text not null default '',
  add column short_description text not null default '',
  add column banner_url text,
  add column subcategory_id uuid references public.content_categories(id) on delete set null,
  add column content_category_id uuid references public.content_categories(id) on delete set null,
  add column tags text[] not null default '{}',
  add column objectives text[] not null default '{}',
  add column audience text not null default '',
  add column prerequisites text not null default '',
  add column learning_outcomes text[] not null default '{}',
  add column position integer not null default 0,
  add column featured boolean not null default false,
  add column certificate_template_id uuid references public.certificate_templates(id) on delete set null,
  add column completion_rules jsonb not null default '{"require_all_required_lessons": true, "min_quiz_score": 0}'::jsonb,
  add column published_at timestamptz,
  add column updated_by uuid;

-- 6. Modulos
create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null default '',
  position integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.course_modules to anon;
grant select, insert, update, delete on public.course_modules to authenticated;
grant all on public.course_modules to service_role;
alter table public.course_modules enable row level security;
create policy "Modulos de cursos publicados sao publicos" on public.course_modules
  for select using (
    public.is_staff(auth.uid()) or exists (
      select 1 from public.courses c where c.id = course_modules.course_id and c.status = 'publicado'::public.content_status
    )
  );
create policy "Staff gerencia modulos" on public.course_modules
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger course_modules_updated_at before update on public.course_modules
  for each row execute function public.set_updated_at();

alter table public.lessons
  add column module_id uuid references public.course_modules(id) on delete set null,
  add column summary text not null default '';

-- 7. Blocos de aula
create table public.lesson_blocks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  type text not null,
  position integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.lesson_blocks to anon;
grant select, insert, update, delete on public.lesson_blocks to authenticated;
grant all on public.lesson_blocks to service_role;
alter table public.lesson_blocks enable row level security;
create policy "Blocos de aulas publicadas sao publicos" on public.lesson_blocks
  for select using (
    public.is_staff(auth.uid()) or exists (
      select 1 from public.lessons l join public.courses c on c.id = l.course_id
      where l.id = lesson_blocks.lesson_id and c.status = 'publicado'::public.content_status
    )
  );
create policy "Staff gerencia blocos" on public.lesson_blocks
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger lesson_blocks_updated_at before update on public.lesson_blocks
  for each row execute function public.set_updated_at();

-- 8. Quizzes
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text not null default 'Quiz',
  description text not null default '',
  attempts_allowed integer not null default 3,
  min_score integer not null default 70,
  required boolean not null default false,
  position integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.quizzes to anon;
grant select, insert, update, delete on public.quizzes to authenticated;
grant all on public.quizzes to service_role;
alter table public.quizzes enable row level security;
create policy "Quizzes de cursos publicados sao publicos" on public.quizzes
  for select using (
    public.is_staff(auth.uid()) or exists (
      select 1 from public.courses c where c.id = quizzes.course_id and c.status = 'publicado'::public.content_status
    )
  );
create policy "Staff gerencia quizzes" on public.quizzes
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger quizzes_updated_at before update on public.quizzes
  for each row execute function public.set_updated_at();

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_index integer not null default 0,
  explanation text not null default '',
  points integer not null default 1,
  position integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.quiz_questions to anon;
grant select, insert, update, delete on public.quiz_questions to authenticated;
grant all on public.quiz_questions to service_role;
alter table public.quiz_questions enable row level security;
create policy "Perguntas de cursos publicados sao publicas" on public.quiz_questions
  for select using (
    public.is_staff(auth.uid()) or exists (
      select 1 from public.quizzes q join public.courses c on c.id = q.course_id
      where q.id = quiz_questions.quiz_id and c.status = 'publicado'::public.content_status
    )
  );
create policy "Staff gerencia perguntas" on public.quiz_questions
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger quiz_questions_updated_at before update on public.quiz_questions
  for each row execute function public.set_updated_at();

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null default 0,
  passed boolean not null default false,
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.quiz_attempts to authenticated;
grant all on public.quiz_attempts to service_role;
alter table public.quiz_attempts enable row level security;
create policy "Aluno gerencia proprias tentativas" on public.quiz_attempts
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Staff ve tentativas" on public.quiz_attempts
  for select to authenticated using (public.is_staff(auth.uid()));

-- 9. Modelos de curriculo
create table public.resume_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  file_url text,
  preview_url text,
  category_id uuid references public.content_categories(id) on delete set null,
  active boolean not null default true,
  recommended boolean not null default false,
  position integer not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.resume_templates to anon;
grant select, insert, update, delete on public.resume_templates to authenticated;
grant all on public.resume_templates to service_role;
alter table public.resume_templates enable row level security;
create policy "Modelos de curriculo ativos sao publicos" on public.resume_templates
  for select using (active or public.is_staff(auth.uid()));
create policy "Staff gerencia modelos de curriculo" on public.resume_templates
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger resume_templates_updated_at before update on public.resume_templates
  for each row execute function public.set_updated_at();

-- 10. Vagas
create table public.job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null default '',
  description text not null default '',
  location text not null default '',
  work_model text not null default '',
  contract_type text not null default '',
  salary text not null default '',
  benefits text not null default '',
  education text not null default '',
  requirements text not null default '',
  area text not null default '',
  image_url text,
  apply_url text,
  category_id uuid references public.content_categories(id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  position integer not null default 0,
  status public.content_status not null default 'rascunho',
  closed boolean not null default false,
  published_at timestamptz,
  deadline date,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.job_openings to anon;
grant select, insert, update, delete on public.job_openings to authenticated;
grant all on public.job_openings to service_role;
alter table public.job_openings enable row level security;
create policy "Vagas publicadas sao publicas" on public.job_openings
  for select using (status = 'publicado'::public.content_status or public.is_staff(auth.uid()));
create policy "Staff gerencia vagas" on public.job_openings
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger job_openings_updated_at before update on public.job_openings
  for each row execute function public.set_updated_at();

-- 11. Concursos
create table public.public_exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization text not null default '',
  state text not null default '',
  city text not null default '',
  education text not null default '',
  role text not null default '',
  vacancies text not null default '',
  salary text not null default '',
  registration_fee text not null default '',
  exam_date date,
  registration_deadline date,
  situation text not null default 'em_breve',
  description text not null default '',
  notice_text text not null default '',
  notice_url text,
  registration_url text,
  image_url text,
  category_id uuid references public.content_categories(id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  position integer not null default 0,
  status public.content_status not null default 'rascunho',
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.public_exams to anon;
grant select, insert, update, delete on public.public_exams to authenticated;
grant all on public.public_exams to service_role;
alter table public.public_exams enable row level security;
create policy "Concursos publicados sao publicos" on public.public_exams
  for select using (status = 'publicado'::public.content_status or public.is_staff(auth.uid()));
create policy "Staff gerencia concursos" on public.public_exams
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger public_exams_updated_at before update on public.public_exams
  for each row execute function public.set_updated_at();

-- 12. Estagios
create table public.internships (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null default '',
  area text not null default '',
  required_course text not null default '',
  location text not null default '',
  work_model text not null default '',
  stipend text not null default '',
  benefits text not null default '',
  weekly_hours text not null default '',
  requirements text not null default '',
  description text not null default '',
  apply_url text,
  image_url text,
  category_id uuid references public.content_categories(id) on delete set null,
  tags text[] not null default '{}',
  featured boolean not null default false,
  position integer not null default 0,
  status public.content_status not null default 'rascunho',
  deadline date,
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.internships to anon;
grant select, insert, update, delete on public.internships to authenticated;
grant all on public.internships to service_role;
alter table public.internships enable row level security;
create policy "Estagios publicados sao publicos" on public.internships
  for select using (status = 'publicado'::public.content_status or public.is_staff(auth.uid()));
create policy "Staff gerencia estagios" on public.internships
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger internships_updated_at before update on public.internships
  for each row execute function public.set_updated_at();

-- 13. Biblioteca de midia
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  path text not null default '',
  mime_type text not null default '',
  size_bytes bigint not null default 0,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select on public.media_assets to anon;
grant select, insert, update, delete on public.media_assets to authenticated;
grant all on public.media_assets to service_role;
alter table public.media_assets enable row level security;
create policy "Midia e publica" on public.media_assets for select using (true);
create policy "Staff gerencia midia" on public.media_assets
  for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- 14. Emissao de certificado respeitando regras de conclusao
create or replace function public.issue_certificate(_course_id uuid)
returns public.certificates
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  _uid uuid := auth.uid();
  _cert public.certificates;
  _course public.courses;
  _name text;
  _progress int;
  _pending int;
begin
  if _uid is null then raise exception 'Não autenticado'; end if;
  if public.is_banned(_uid) then raise exception 'Conta banida'; end if;

  select * into _course from public.courses where id = _course_id;
  if _course.id is null then raise exception 'Curso não encontrado'; end if;
  if _course.is_external then raise exception 'Cursos externos não emitem certificado'; end if;

  select progress into _progress from public.enrollments where user_id = _uid and course_id = _course_id;
  if coalesce(_progress,0) < 100 then raise exception 'Curso não concluído'; end if;

  select count(*) into _pending
  from public.quizzes q
  where q.course_id = _course_id and q.required
    and not exists (
      select 1 from public.quiz_attempts a
      where a.quiz_id = q.id and a.user_id = _uid and a.passed
    );
  if _pending > 0 then raise exception 'Existem atividades obrigatórias pendentes'; end if;

  select * into _cert from public.certificates where user_id = _uid and course_id = _course_id;
  if _cert.id is not null then return _cert; end if;

  select coalesce(nullif(full_name,''), email) into _name from public.profiles where id = _uid;

  insert into public.certificates (user_id, course_id, code, student_name, course_name, hours)
  values (_uid, _course_id, 'CA-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)),
          coalesce(_name,'Aluno'), _course.title, _course.hours)
  returning * into _cert;
  return _cert;
end; $function$;