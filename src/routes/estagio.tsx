import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { OportunidadeList } from "@/components/site/OportunidadeList";

export const Route = createFileRoute("/estagio")({
  head: () => ({
    meta: [
      { title: "Vagas de estágio e jovem aprendiz | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Estágios e programas de aprendizagem para estudantes de ensino médio, técnico e superior.",
      },
      { property: "og:title", content: "Estágio e aprendizagem" },
      {
        property: "og:description",
        content: "Encontre estágios e programas de jovem aprendiz abertos.",
      },
      { property: "og:url", content: "/estagio" },
    ],
    links: [{ rel: "canonical", href: "/estagio" }],
  }),
  component: EstagioPage,
});

function EstagioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Estudar e trabalhar"
        title="Estágio"
        description="Estágios e programas de aprendizagem ideais para quem ainda está estudando."
      />
      <OportunidadeList tipos={["Estágio", "Aprendizagem"]} />
    </>
  );
}
