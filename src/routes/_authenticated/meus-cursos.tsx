import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/site/PageHeader";
import { BarraProgresso } from "@/components/site/BarraProgresso";

export const Route = createFileRoute("/_authenticated/meus-cursos")({
  head: () => ({
    meta: [
      { title: "Meus cursos | Conecta Oportunidades" },
      {
        name: "description",
        content: "Acompanhe seus cursos iniciados, em andamento e concluídos no ConectAção.",
      },
      { property: "og:title", content: "Meus cursos" },
      { property: "og:description", content: "Continue de onde parou nos seus cursos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MeusCursosPage,
});

type Item = {
  progress: number;
  completed_at: string | null;
  courses: { id: string; title: string; slug: string; hours: number } | null;
};

function MeusCursosPage() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<"todos" | "andamento" | "concluidos">("todos");

  const { data = [], isLoading } = useQuery({
    queryKey: ["meus-cursos", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("progress, completed_at, courses(id, title, slug, hours)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Item[];
    },
  });

  const lista = useMemo(
    () =>
      data.filter((i) =>
        filtro === "andamento"
          ? i.progress < 100
          : filtro === "concluidos"
            ? i.progress >= 100
            : true,
      ),
    [data, filtro],
  );

  return (
    <>
      <PageHeader
        eyebrow="Sua área"
        title="Meus cursos"
        description="Continue de onde parou. Seu progresso fica salvo automaticamente."
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["todos", "Todos"],
              ["andamento", "Em andamento"],
              ["concluidos", "Concluídos"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFiltro(id)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase transition-colors ${
                filtro === id
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {lista.map(
            (item) =>
              item.courses && (
                <article
                  key={item.courses.id}
                  className="rounded-3xl border border-border bg-card p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg">{item.courses.title}</h2>
                    <span className="text-sm font-bold text-primary">{item.progress}%</span>
                  </div>
                  <div className="mt-3">
                    <BarraProgresso valor={item.progress} />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to="/curso/$slug"
                      params={{ slug: item.courses.slug }}
                      className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
                    >
                      {item.progress >= 100 ? "Rever curso" : "Continuar curso"}
                    </Link>
                    {item.progress >= 100 && (
                      <Link
                        to="/certificados"
                        className="rounded-full border border-primary px-5 py-2 text-sm font-bold text-primary"
                      >
                        Ver certificado
                      </Link>
                    )}
                  </div>
                </article>
              ),
          )}
        </div>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && lista.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Você ainda não iniciou cursos.{" "}
            <Link to="/cursos" className="font-bold text-primary">
              Explorar cursos
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
