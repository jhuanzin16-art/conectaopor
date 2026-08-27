import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Award } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { categorias, cursos } from "@/lib/site-data";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos gratuitos e com certificado | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Lista de cursos gratuitos e cursos com certificado em tecnologia, administração, direito, marketing, finanças e idiomas.",
      },
      { property: "og:title", content: "Cursos gratuitos e com certificado" },
      {
        property: "og:description",
        content: "Encontre cursos gratuitos e com certificado por categoria.",
      },
      { property: "og:url", content: "/cursos" },
    ],
    links: [{ rel: "canonical", href: "/cursos" }],
  }),
  component: CursosPage,
});

function CursosPage() {
  const [categoria, setCategoria] = useState<string>("Todos");
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return cursos
      .filter((c) => categoria === "Todos" || c.categoria === categoria)
      .filter(
        (c) =>
          !termo ||
          c.nome.toLowerCase().includes(termo) ||
          c.instituicao.toLowerCase().includes(termo),
      );
  }, [categoria, busca]);

  return (
    <>
      <PageHeader
        eyebrow="Aprender"
        title="Cursos"
        description="Cursos gratuitos e opções com certificado para você começar hoje mesmo."
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar cursos..."
            aria-label="Pesquisar cursos"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Todos", ...categorias].map((c) => (
            <button
              key={c}
              onClick={() => setCategoria(c)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase transition-colors ${
                categoria === c
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <article
              key={c.id}
              className="flex flex-col rounded-3xl border border-border bg-card p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase text-primary">
                  {c.categoria}
                </span>
                {c.certificado && (
                  <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-primary">
                    <Award className="size-3.5" /> Certificado
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-lg leading-tight">{c.nome}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.instituicao} • {c.duracao}
              </p>
              <BotaoSalvar curso={c} />
            </article>
          ))}
          {lista.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum curso encontrado.</p>
          )}
        </div>
      </div>
    </>
  );
}
