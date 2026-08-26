import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { OportunidadeList } from "@/components/site/OportunidadeList";

export const Route = createFileRoute("/concursos")({
  head: () => ({
    meta: [
      { title: "Concursos públicos abertos | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Concursos públicos com vagas de nível médio e superior: banca, requisitos e prazo de inscrição.",
      },
      { property: "og:title", content: "Concursos públicos abertos" },
      {
        property: "og:description",
        content: "Editais de concursos para quem busca estabilidade profissional.",
      },
      { property: "og:url", content: "/concursos" },
    ],
    links: [{ rel: "canonical", href: "/concursos" }],
  }),
  component: ConcursosPage,
});

function ConcursosPage() {
  return (
    <>
      <PageHeader
        eyebrow="Carreira pública"
        title="Concursos"
        description="Editais abertos com vagas de nível médio e superior em todo o país."
      />
      <OportunidadeList tipos={["Concurso"]} />
    </>
  );
}
