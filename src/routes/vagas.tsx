import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { OportunidadeList } from "@/components/site/OportunidadeList";

export const Route = createFileRoute("/vagas")({
  head: () => ({
    meta: [
      { title: "Vagas de emprego para iniciantes | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Vagas de emprego para quem está começando: requisitos, localização e prazo de inscrição.",
      },
      { property: "og:title", content: "Vagas de emprego" },
      {
        property: "og:description",
        content: "Oportunidades de emprego para o primeiro emprego e início de carreira.",
      },
      { property: "og:url", content: "/vagas" },
    ],
    links: [{ rel: "canonical", href: "/vagas" }],
  }),
  component: VagasPage,
});

function VagasPage() {
  return (
    <>
      <PageHeader
        eyebrow="Trabalhar"
        title="Vagas de emprego"
        description="Oportunidades de emprego para quem está dando os primeiros passos na carreira."
      />
      <OportunidadeList tipos={["Emprego"]} />
    </>
  );
}
