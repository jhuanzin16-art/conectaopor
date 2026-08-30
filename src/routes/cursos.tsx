import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Award, ExternalLink, Clock, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import {
  listarCategorias,
  listarCursosPublicados,
  rotuloNivel,
  type CursoDB,
  type Nivel,
} from "@/lib/cursos-db";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos gratuitos e com certificado | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Cursos gratuitos do ConectAção e cursos externos recomendados em tecnologia, administração, carreira, direito, finanças e design.",
      },
      { property: "og:title", content: "Cursos gratuitos e com certificado" },
      {
        property: "og:description",
        content: "Encontre cursos por categoria, nível e carga horária.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/cursos" }],
  }),
  component: CursosPage,
});

const cargas = [
  { id: "todas", label: "Todas" },
  { id: "ate10", label: "Até 10 horas" },
  { id: "10a20", label: "10 a 20 horas" },
  { id: "20a40", label: "20 a 40 horas" },
  { id: "mais40", label: "Mais de 40 horas" },
] as const;

function dentroDaCarga(h: number, filtro: string) {
  if (filtro === "ate10") return h <= 10;
  if (filtro === "10a20") return h > 10 && h <= 20;
  if (filtro === "20a40") return h > 20 && h <= 40;
  if (filtro === "mais40") return h > 40;
  return true;
}

function Chip({
  ativo,
  children,
  onClick,
}: {
  ativo: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-bold uppercase transition-colors ${
        ativo
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function CardCurso({ curso, categoria }: { curso: CursoDB; categoria?: string }) {
  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card p-6 transition-transform hover:-translate-y-1">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase text-primary">
          {categoria ?? "Outros"}
        </span>
        {curso.is_external ? (
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-muted-foreground">
            <ExternalLink className="size-3.5" /> {curso.platform ?? "Externo"}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-primary">
            <Award className="size-3.5" /> Certificado
          </span>
        )}
      </div>

      <h2 className="mt-4 text-lg leading-tight">{curso.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{curso.description}</p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" /> {curso.hours}h
        </span>
        <span className="flex items-center gap-1">
          <BarChart3 className="size-3.5" /> {rotuloNivel[curso.level]}
        </span>
      </div>

      {curso.is_external ? (
        <a
          href={curso.external_url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 rounded-full border border-primary py-2.5 text-center text-sm font-bold text-primary"
        >
          Acessar curso
        </a>
      ) : (
        <Link
          to="/curso/$slug"
          params={{ slug: curso.slug }}
          className="mt-6 rounded-full bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground"
        >
          Ver curso
        </Link>
      )}
    </article>
  );
}

function CursosPage() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [nivel, setNivel] = useState<"todos" | Nivel>("todos");
  const [carga, setCarga] = useState<string>("todas");
  const [tipo, setTipo] = useState<"todos" | "proprios" | "externos">("todos");
  const [ordem, setOrdem] = useState("recentes");

  const { data: cursos = [], isLoading } = useQuery({
    queryKey: ["cursos-publicados"],
    queryFn: listarCursosPublicados,
  });
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: listarCategorias,
  });

  const nomeCategoria = useMemo(
    () => Object.fromEntries(categorias.map((c) => [c.id, c.name])),
    [categorias],
  );

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtrados = cursos
      .filter((c) => categoria === "todas" || c.category_id === categoria)
      .filter((c) => nivel === "todos" || c.level === nivel)
      .filter((c) => dentroDaCarga(Number(c.hours), carga))
      .filter((c) =>
        tipo === "todos" ? true : tipo === "externos" ? c.is_external : !c.is_external,
      )
      .filter(
        (c) =>
          !termo ||
          c.title.toLowerCase().includes(termo) ||
          c.description.toLowerCase().includes(termo) ||
          (c.platform ?? "").toLowerCase().includes(termo),
      );

    const ordenados = [...filtrados];
    if (ordem === "populares") ordenados.sort((a, b) => b.views_count - a.views_count);
    else if (ordem === "menor") ordenados.sort((a, b) => Number(a.hours) - Number(b.hours));
    else if (ordem === "maior") ordenados.sort((a, b) => Number(b.hours) - Number(a.hours));
    else ordenados.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return ordenados;
  }, [cursos, busca, categoria, nivel, carga, tipo, ordem]);

  return (
    <>
      <PageHeader
        eyebrow="Aprender"
        title="Cursos"
        description="Cursos do ConectAção com certificado e cursos externos recomendados."
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

        <div className="mt-8 space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase text-muted-foreground">Categoria</p>
            <div className="flex flex-wrap gap-2">
              <Chip ativo={categoria === "todas"} onClick={() => setCategoria("todas")}>
                Todas
              </Chip>
              {categorias.map((c) => (
                <Chip key={c.id} ativo={categoria === c.id} onClick={() => setCategoria(c.id)}>
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-muted-foreground">Nível</p>
              <div className="flex flex-wrap gap-2">
                <Chip ativo={nivel === "todos"} onClick={() => setNivel("todos")}>
                  Todos
                </Chip>
                {(["iniciante", "intermediario", "avancado"] as Nivel[]).map((n) => (
                  <Chip key={n} ativo={nivel === n} onClick={() => setNivel(n)}>
                    {rotuloNivel[n]}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-muted-foreground">Tipo</p>
              <div className="flex flex-wrap gap-2">
                <Chip ativo={tipo === "todos"} onClick={() => setTipo("todos")}>
                  Todos
                </Chip>
                <Chip ativo={tipo === "proprios"} onClick={() => setTipo("proprios")}>
                  ConectAção
                </Chip>
                <Chip ativo={tipo === "externos"} onClick={() => setTipo("externos")}>
                  Externos
                </Chip>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-1">
              <div>
                <label
                  htmlFor="carga"
                  className="mb-2 block text-[11px] font-bold uppercase text-muted-foreground"
                >
                  Carga horária
                </label>
                <select
                  id="carga"
                  value={carga}
                  onChange={(e) => setCarga(e.target.value)}
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                >
                  {cargas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="ordem"
                  className="mb-2 block text-[11px] font-bold uppercase text-muted-foreground"
                >
                  Ordenar por
                </label>
                <select
                  id="ordem"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value)}
                  className="w-full rounded-full border border-border bg-card px-4 py-2 text-sm"
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="populares">Mais populares</option>
                  <option value="menor">Menor carga horária</option>
                  <option value="maior">Maior carga horária</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <CardCurso key={c.id} curso={c} categoria={nomeCategoria[c.category_id ?? ""]} />
          ))}
        </div>

        {!isLoading && lista.length === 0 && (
          <p className="mt-10 text-sm text-muted-foreground">Nenhum curso encontrado.</p>
        )}
        {isLoading && <p className="mt-10 text-sm text-muted-foreground">Carregando cursos...</p>}
      </div>
    </>
  );
}
