import { createFileRoute } from "@tanstack/react-router";
import { GerenciadorOportunidades, type CampoConfig } from "@/components/admin/GerenciadorOportunidades";

export const Route = createFileRoute("/_authenticated/admin/concursos")({
  head: () => ({
    meta: [
      { title: "Gerenciar concursos públicos | Conecta Oportunidades" },
      {
        name: "description",
        content: "Cadastre editais, prazos, vagas e links de inscrição dos concursos públicos.",
      },
      { property: "og:title", content: "Gerenciar concursos públicos" },
      { property: "og:description", content: "Administração dos concursos publicados no site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminConcursos,
});

const campos: CampoConfig[] = [
  { chave: "organization", rotulo: "Órgão" },
  { chave: "role", rotulo: "Cargo" },
  { chave: "city", rotulo: "Cidade" },
  { chave: "state", rotulo: "Estado" },
  { chave: "vacancies", rotulo: "Número de vagas" },
  { chave: "salary", rotulo: "Remuneração" },
  { chave: "education", rotulo: "Escolaridade exigida" },
  { chave: "situation", rotulo: "Situação (aberto, previsto, encerrado)" },
  { chave: "registration_fee", rotulo: "Taxa de inscrição" },
  { chave: "registration_deadline", rotulo: "Prazo de inscrição", tipo: "date" },
  { chave: "exam_date", rotulo: "Data da prova", tipo: "date" },
  { chave: "registration_url", rotulo: "Link de inscrição", tipo: "url" },
  { chave: "notice_url", rotulo: "Link do edital (PDF)", tipo: "url" },
  { chave: "notice_text", rotulo: "Resumo do edital", tipo: "area", largura: "inteira" },
];

const padrao = {
  organization: "",
  role: "",
  city: "",
  state: "",
  vacancies: "",
  salary: "",
  education: "",
  situation: "aberto",
  registration_fee: "",
  registration_deadline: "",
  exam_date: "",
  registration_url: "",
  notice_url: "",
  notice_text: "",
};

function AdminConcursos() {
  return (
    <GerenciadorOportunidades
      tabela="public_exams"
      escopo="concurso"
      titulo="Concursos públicos"
      subtitulo="Editais, prazos e links exibidos na página de concursos."
      campos={campos}
      padrao={padrao}
    />
  );
}
