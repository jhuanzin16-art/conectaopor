import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/_authenticated/certificados")({
  head: () => ({
    meta: [
      { title: "Meus certificados | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Veja, baixe em PDF e compartilhe os certificados dos cursos concluídos no ConectAção.",
      },
      { property: "og:title", content: "Meus certificados" },
      { property: "og:description", content: "Certificados dos cursos concluídos no ConectAção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CertificadosPage,
});

function CertificadosPage() {
  const { user } = useAuth();
  const { data = [], isLoading } = useQuery({
    queryKey: ["meus-certificados", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id, code, course_name, hours, issued_at")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Sua área"
        title="Meus certificados"
        description="Certificados emitidos após a conclusão de 100% das aulas obrigatórias."
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2">
          {data.map((c) => (
            <article key={c.id} className="rounded-3xl border border-border bg-card p-6">
              <Award className="size-6 text-primary" />
              <h2 className="mt-3 text-lg leading-tight">{c.course_name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.hours}h • emitido em {new Date(c.issued_at).toLocaleDateString("pt-BR")}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-primary">
                Código {c.code}
              </p>
              <Link
                to="/certificado/$codigo"
                params={{ codigo: c.code }}
                className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground"
              >
                Ver / baixar PDF
              </Link>
            </article>
          ))}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Você ainda não possui certificados. Conclua um curso do ConectAção para emitir o
            primeiro.{" "}
            <Link to="/cursos" className="font-bold text-primary">
              Ver cursos
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
