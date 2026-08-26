import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { conteudos } from "@/lib/site-data";

export const Route = createFileRoute("/conteudos")({
  head: () => ({
    meta: [
      { title: "Dicas de carreira e materiais para estudantes | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Artigos e dicas sobre primeiro emprego, currículo, entrevista, cursos gratuitos, estágio e habilidades profissionais.",
      },
      { property: "og:title", content: "Dicas e conteúdos de carreira" },
      {
        property: "og:description",
        content: "Materiais práticos para melhorar sua preparação profissional.",
      },
      { property: "og:url", content: "/conteudos" },
    ],
    links: [{ rel: "canonical", href: "/conteudos" }],
  }),
  component: ConteudosPage,
});

function ConteudosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Conteúdos"
        title="Dicas e materiais"
        description="Artigos curtos e diretos para você se preparar melhor para o mercado de trabalho."
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {conteudos.map((c) => (
          <article
            key={c.id}
            className="rounded-3xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
          >
            <span className="text-[11px] font-bold uppercase text-primary">
              Leitura de {c.tempo}
            </span>
            <h2 className="mt-3 text-lg leading-tight">{c.titulo}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{c.resumo}</p>
          </article>
        ))}
      </div>
    </>
  );
}
