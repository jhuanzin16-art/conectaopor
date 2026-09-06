import { createFileRoute } from "@tanstack/react-router";
import { GerenciadorOportunidades, type CampoConfig } from "@/components/admin/GerenciadorOportunidades";

export const Route = createFileRoute("/_authenticated/admin/vagas")({
  head: () => ({
    meta: [
      { title: "Gerenciar vagas de emprego | Conecta Oportunidades" },
      {
        name: "description",
        content: "Publique, edite, destaque e arquive vagas de emprego do Conecta Oportunidades.",
      },
      { property: "og:title", content: "Gerenciar vagas de emprego" },
      { property: "og:description", content: "Administração das vagas publicadas no site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminVagas,
});

const campos: CampoConfig[] = [
  { chave: "company", rotulo: "Empresa" },
  { chave: "area", rotulo: "Área" },
  { chave: "location", rotulo: "Cidade/Estado" },
  { chave: "work_model", rotulo: "Modelo de trabalho (presencial, híbrido, remoto)" },
  { chave: "contract_type", rotulo: "Tipo de contrato (CLT, PJ, temporário)" },
  { chave: "salary", rotulo: "Salário" },
  { chave: "education", rotulo: "Escolaridade exigida" },
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
  contract_type: "",
  salary: "",
  education: "",
  deadline: "",
  apply_url: "",
  requirements: "",
  benefits: "",
  closed: false,
};

function AdminVagas() {
  return (
    <GerenciadorOportunidades
      tabela="job_openings"
      escopo="vaga"
      titulo="Vagas de emprego"
      subtitulo="Tudo o que aparece na página de vagas é controlado aqui."
      campos={campos}
      padrao={padrao}
    />
  );
}
