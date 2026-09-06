import { createFileRoute } from "@tanstack/react-router";
import { GerenciadorOportunidades, type CampoConfig } from "@/components/admin/GerenciadorOportunidades";

export const Route = createFileRoute("/_authenticated/admin/estagios")({
  head: () => ({
    meta: [
      { title: "Gerenciar estágios | Conecta Oportunidades" },
      {
        name: "description",
        content: "Publique oportunidades de estágio com bolsa, carga horária e curso exigido.",
      },
      { property: "og:title", content: "Gerenciar estágios" },
      { property: "og:description", content: "Administração dos estágios publicados no site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminEstagios,
});

const campos: CampoConfig[] = [
  { chave: "company", rotulo: "Empresa" },
  { chave: "area", rotulo: "Área" },
  { chave: "location", rotulo: "Cidade/Estado" },
  { chave: "work_model", rotulo: "Modelo (presencial, híbrido, remoto)" },
  { chave: "required_course", rotulo: "Curso exigido" },
  { chave: "stipend", rotulo: "Bolsa-auxílio" },
  { chave: "weekly_hours", rotulo: "Carga horária semanal" },
  { chave: "deadline", rotulo: "Prazo de inscrição", tipo: "date" },
  { chave: "apply_url", rotulo: "Link para candidatura", tipo: "url" },
  { chave: "requirements", rotulo: "Requisitos", tipo: "area", largura: "inteira" },
  { chave: "benefits", rotulo: "Benefícios", tipo: "area", largura: "inteira" },
];

const padrao = {
  company: "",
  area: "",
  location: "",
  work_model: "",
  required_course: "",
  stipend: "",
  weekly_hours: "",
  deadline: "",
  apply_url: "",
  requirements: "",
  benefits: "",
};

function AdminEstagios() {
  return (
    <GerenciadorOportunidades
      tabela="internships"
      escopo="estagio"
      titulo="Estágios"
      subtitulo="Oportunidades de estágio exibidas na página de estágios."
      campos={campos}
      padrao={padrao}
    />
  );
}
