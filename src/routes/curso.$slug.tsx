import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Clock, BarChart3, Award, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarraProgresso } from "@/components/site/BarraProgresso";
import { CURSO_FIELDS, rotuloNivel, type CursoDB } from "@/lib/cursos-db";

export const Route = createFileRoute("/curso/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Curso ${params.slug.replace(/-/g, " ")} | Conecta Oportunidades` },
      {
        name: "description",
        content:
          "Faça o curso gratuito no ConectAção, acompanhe seu progresso e emita seu certificado ao concluir 100% das aulas.",
      },
      { property: "og:title", content: "Curso gratuito no ConectAção" },
      {
        property: "og:description",
        content: "Aulas online gratuitas com progresso salvo e certificado.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CursoPage,
});

type Lesson = {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  position: number;
  duration_min: number;
  required: boolean;
};

function CursoPage() {
  const { slug } = useParams({ from: "/curso/$slug" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [aulaAtiva, setAulaAtiva] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const { data: curso, isLoading } = useQuery({
    queryKey: ["curso", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(CURSO_FIELDS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data as CursoDB | null;
    },
  });

  const { data: aulas = [] } = useQuery({
    queryKey: ["aulas", curso?.id],
    enabled: !!curso?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, content, video_url, position, duration_min, required")
        .eq("course_id", curso!.id)
        .eq("status", "publicado")
        .order("position");
      if (error) throw error;
      return (data ?? []) as Lesson[];
    },
  });

  const { data: matricula } = useQuery({
    queryKey: ["matricula", curso?.id, user?.id],
    enabled: !!curso?.id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("id, progress, completed_at")
        .eq("course_id", curso!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: concluidas = [] } = useQuery({
    queryKey: ["aulas-concluidas", curso?.id, user?.id],
    enabled: !!curso?.id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("course_id", curso!.id);
      if (error) throw error;
      return (data ?? []).map((l) => l.lesson_id);
    },
  });

  const { data: certificado } = useQuery({
    queryKey: ["certificado", curso?.id, user?.id],
    enabled: !!curso?.id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("code")
        .eq("course_id", curso!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (curso?.id) void supabase.rpc("increment_course_views", { _course_id: curso.id });
  }, [curso?.id]);

  if (isLoading) {
    return <p className="mx-auto max-w-4xl px-4 py-20 text-muted-foreground">Carregando...</p>;
  }
  if (!curso) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20">
        <h1 className="text-2xl">Curso não encontrado</h1>
        <Link to="/cursos" className="mt-4 inline-block font-bold text-primary">
          Voltar para cursos
        </Link>
      </div>
    );
  }

  const progresso = matricula?.progress ?? 0;

  async function comecar() {
    if (!user || !curso) return;
    await supabase
      .from("enrollments")
      .upsert({ user_id: user.id, course_id: curso.id }, { onConflict: "user_id,course_id" });
    qc.invalidateQueries({ queryKey: ["matricula"] });
    if (aulas[0]) setAulaAtiva(aulas[0].id);
  }

  async function alternarAula(aula: Lesson, feita: boolean) {
    if (!user || !curso) return;
    if (feita) {
      await supabase.from("lesson_progress").delete().eq("lesson_id", aula.id);
    } else {
      await supabase
        .from("lesson_progress")
        .insert({ user_id: user.id, course_id: curso.id, lesson_id: aula.id });
    }
    qc.invalidateQueries({ queryKey: ["aulas-concluidas"] });
    qc.invalidateQueries({ queryKey: ["matricula"] });
  }

  async function emitirCertificado() {
    if (!curso) return;
    setMsg("");
    const { error } = await supabase.rpc("issue_certificate", { _course_id: curso.id });
    if (error) setMsg(error.message);
    else qc.invalidateQueries({ queryKey: ["certificado"] });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link to="/cursos" className="text-xs font-bold uppercase text-primary">
        ← Todos os cursos
      </Link>

      <header className="mt-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h1 className="text-3xl leading-tight">{curso.title}</h1>
        <p className="mt-3 text-muted-foreground">{curso.description}</p>
        <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> {curso.hours}h
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="size-3.5" /> {rotuloNivel[curso.level]}
          </span>
          <span className="flex items-center gap-1">
            <User className="size-3.5" /> {curso.instructor}
          </span>
        </div>

        {!user ? (
          <Link
            to="/entrar"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Entrar para começar o curso
          </Link>
        ) : !matricula ? (
          <button
            onClick={comecar}
            className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Começar curso
          </button>
        ) : (
          <div className="mt-6 max-w-md">
            <div className="mb-2 flex justify-between text-xs font-bold uppercase text-muted-foreground">
              <span>Seu progresso</span>
              <span>{progresso}%</span>
            </div>
            <BarraProgresso valor={progresso} />
            {progresso >= 100 &&
              (certificado ? (
                <Link
                  to="/certificado/$codigo"
                  params={{ codigo: certificado.code }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  <Award className="size-4" /> Ver certificado
                </Link>
              ) : (
                <button
                  onClick={emitirCertificado}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
                >
                  <Award className="size-4" /> Emitir certificado
                </button>
              ))}
            {msg && <p className="mt-3 text-sm text-destructive">{msg}</p>}
          </div>
        )}
      </header>

      <section className="mt-10">
        <h2 className="text-xl">Aulas do curso</h2>
        <ul className="mt-4 space-y-3">
          {aulas.map((aula) => {
            const feita = concluidas.includes(aula.id);
            const aberta = aulaAtiva === aula.id;
            return (
              <li key={aula.id} className="rounded-3xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <button
                    className="flex-1 text-left"
                    onClick={() => setAulaAtiva(aberta ? null : aula.id)}
                  >
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Aula {aula.position} • {aula.duration_min} min
                    </span>
                    <p className="mt-1 font-bold">{aula.title}</p>
                  </button>
                  {matricula && (
                    <button
                      onClick={() => alternarAula(aula, feita)}
                      aria-label={feita ? "Marcar como não concluída" : "Marcar como concluída"}
                      className={`shrink-0 rounded-full p-1 ${feita ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {feita ? <CheckCircle2 className="size-6" /> : <Circle className="size-6" />}
                    </button>
                  )}
                </div>
                {aberta && (
                  <div className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                    <p>{aula.content}</p>
                    {aula.video_url && (
                      <a
                        href={aula.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block font-bold text-primary"
                      >
                        Abrir material da aula
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
          {aulas.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Este curso ainda não possui aulas publicadas.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}
