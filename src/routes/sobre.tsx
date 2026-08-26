import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o projeto Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Projeto acadêmico que centraliza cursos, orientação de currículo e oportunidades de emprego, estágio e concursos para estudantes.",
      },
      { property: "og:title", content: "Sobre o projeto" },
      {
        property: "og:description",
        content: "Objetivo, problema, solução, público-alvo e equipe do projeto.",
      },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: SobrePage,
});

const blocos = [
  {
    titulo: "Objetivo",
    texto:
      "Reunir em um só lugar informações e ferramentas que ajudem estudantes a entrar no mercado de trabalho.",
  },
  {
    titulo: "Problema identificado",
    texto:
      "As informações sobre cursos, currículo e vagas estão espalhadas em muitos sites, o que dificulta o acesso de quem está começando.",
  },
  {
    titulo: "Solução proposta",
    texto:
      "Uma plataforma simples com busca, filtros e conteúdo em linguagem acessível, preparada para receber banco de dados e autenticação real.",
  },
  {
    titulo: "Público-alvo",
    texto:
      "Estudantes de ensino médio, técnico e superior e pessoas em busca do primeiro emprego ou estágio.",
  },
  {
    titulo: "Benefícios",
    texto:
      "Economia de tempo, orientação prática de currículo e acesso gratuito a cursos e oportunidades.",
  },
  {
    titulo: "Equipe responsável",
    texto:
      "Projeto desenvolvido por estudantes da faculdade como trabalho acadêmico interdisciplinar.",
  },
];

function SobrePage() {
  return (
    <>
      <PageHeader
        eyebrow="Projeto acadêmico"
        title="Sobre o projeto"
        description="Conheça o objetivo, o problema identificado e a solução proposta pela plataforma."
      />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {blocos.map((b) => (
          <section key={b.titulo} className="rounded-3xl border border-border bg-card p-7">
            <h2 className="text-base uppercase text-primary">{b.titulo}</h2>
            <p className="mt-3 text-sm text-muted-foreground">{b.texto}</p>
          </section>
        ))}
      </div>
    </>
  );
}
