import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/curriculo")({
  head: () => ({
    meta: [
      { title: "Como fazer um currículo: modelo passo a passo | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Aprenda a fazer seu currículo em 7 etapas: dados pessoais, objetivo, formação, experiência, cursos, habilidades e informações adicionais.",
      },
      { property: "og:title", content: "Aprenda a fazer seu currículo" },
      {
        property: "og:description",
        content: "Modelo de currículo explicado etapa por etapa, mesmo sem experiência.",
      },
      { property: "og:url", content: "/curriculo" },
    ],
    links: [{ rel: "canonical", href: "/curriculo" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Como fazer um currículo profissional",
          step: [
            "Dados pessoais",
            "Objetivo profissional",
            "Formação acadêmica",
            "Experiência profissional",
            "Cursos e certificados",
            "Habilidades",
            "Informações adicionais",
          ].map((n, i) => ({ "@type": "HowToStep", position: i + 1, name: n })),
        }),
      },
    ],
  }),
  component: CurriculoPage,
});

const etapas = [
  {
    titulo: "Dados pessoais",
    texto: "Nome completo, cidade, telefone e e-mail profissional. Não use apelidos.",
  },
  {
    titulo: "Objetivo profissional",
    texto: "Uma frase curta dizendo a área ou o cargo que você busca.",
  },
  {
    titulo: "Formação acadêmica",
    texto: "Curso, instituição e ano de conclusão (ou previsão). Comece pelo mais recente.",
  },
  {
    titulo: "Experiência profissional",
    texto:
      "Empresa, cargo, período e o que você fazia. Sem experiência? Use trabalhos voluntários e projetos.",
  },
  {
    titulo: "Cursos e certificados",
    texto: "Liste cursos livres com carga horária — eles valorizam muito o currículo.",
  },
  {
    titulo: "Habilidades",
    texto: "Informática, idiomas e habilidades comportamentais como trabalho em equipe.",
  },
  {
    titulo: "Informações adicionais",
    texto: "Disponibilidade de horário, CNH e outras informações relevantes para a vaga.",
  },
];

function CurriculoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Currículo"
        title="Aprenda a fazer seu currículo"
        description="Um guia simples, etapa por etapa, para montar um currículo profissional mesmo sem experiência."
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <ol className="space-y-4">
          {etapas.map((e, i) => (
            <li
              key={e.titulo}
              className="flex gap-5 rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm text-primary-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-lg leading-tight">{e.titulo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{e.texto}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-3xl bg-primary-soft p-8 text-center">
          <h2 className="text-2xl uppercase">Pronto para começar?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie sua conta e monte seu currículo com o nosso passo a passo.
          </p>
          <Link
            to="/cadastro"
            className="mt-6 inline-block rounded-full bg-primary px-8 py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft"
          >
            Criar meu currículo
          </Link>
        </div>
      </div>
    </>
  );
}
