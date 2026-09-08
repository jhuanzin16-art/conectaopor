import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { listarCategorias, textoParaLista, type Escopo } from "@/lib/conteudo";

type Tipo = "vaga" | "concurso" | "estagio";

const TABELA: Record<Tipo, "job_openings" | "public_exams" | "internships"> = {
  vaga: "job_openings",
  concurso: "public_exams",
  estagio: "internships",
};

type Item = {
  id: string;
  title: string;
  description: string;
  category_id: string | null;
  tags: string[];
  image_url: string | null;
  featured: boolean;
  position: number;
  subtitulo: string;
  local: string;
  detalhes: { rotulo: string; valor: string }[];
  requisitos: string[];
  link: string | null;
  prazo: string | null;
};

function formatarData(valor: string | null) {
  if (!valor) return null;
  const d = new Date(`${valor}T12:00:00`);
  return Number.isNaN(d.getTime()) ? valor : d.toLocaleDateString("pt-BR");
}

function detalhe(rotulo: string, valor?: string | null) {
  return valor ? [{ rotulo, valor }] : [];
}

type Bruto = Record<string, unknown>;

function txt(r: Bruto, chave: string) {
  const v = r[chave];
  return typeof v === "string" ? v : "";
}

function mapear(tipo: Tipo, r: Bruto): Item {
  const base = {
    id: txt(r, "id"),
    title: txt(r, "title"),
    description: txt(r, "description"),
    category_id: (r["category_id"] as string | null) ?? null,
    tags: (r["tags"] as string[] | null) ?? [],
    image_url: (r["image_url"] as string | null) ?? null,
    featured: Boolean(r["featured"]),
    position: Number(r["position"] ?? 0),
  };

  if (tipo === "concurso") {
    return {
      ...base,
      subtitulo: txt(r, "organization"),
      local: [txt(r, "city"), txt(r, "state")].filter(Boolean).join(" - "),
      detalhes: [
        ...detalhe("Cargo", txt(r, "role")),
        ...detalhe("Vagas", txt(r, "vacancies")),
        ...detalhe("Remuneração", txt(r, "salary")),
        ...detalhe("Escolaridade", txt(r, "education")),
        ...detalhe("Taxa", txt(r, "registration_fee")),
        ...detalhe("Situação", txt(r, "situation")),
        ...detalhe("Prova", formatarData(txt(r, "exam_date") || null)),
      ],
      requisitos: textoParaLista(txt(r, "notice_text")),
      link: txt(r, "registration_url") || txt(r, "notice_url") || null,
      prazo: formatarData(txt(r, "registration_deadline") || null),
    };
  }

  return {
    ...base,
    subtitulo: txt(r, "company"),
    local: txt(r, "location"),
    detalhes: [
      ...detalhe("Área", txt(r, "area")),
      ...detalhe("Modelo", txt(r, "work_model")),
      ...detalhe(
        tipo === "vaga" ? "Contrato" : "Curso exigido",
        tipo === "vaga" ? txt(r, "contract_type") : txt(r, "required_course"),
      ),
      ...detalhe(
        tipo === "vaga" ? "Salário" : "Bolsa",
        tipo === "vaga" ? txt(r, "salary") : txt(r, "stipend"),
      ),
      ...detalhe("Carga horária", txt(r, "weekly_hours")),
      ...detalhe("Escolaridade", txt(r, "education")),
    ],
    requisitos: textoParaLista(txt(r, "requirements")),
    link: txt(r, "apply_url") || null,
    prazo: formatarData(txt(r, "deadline") || null),
  };
}

export function OportunidadeList({ tipo }: { tipo: Tipo }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");

  const { data: itens = [], isLoading } = useQuery({
    queryKey: ["oportunidades", tipo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(TABELA[tipo])
        .select("*")
        .eq("status", "publicado")
        .order("featured", { ascending: false })
        .order("position");
      if (error) throw error;
      return (data ?? []).map((r) => mapear(tipo, r as Bruto));
    },
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias", tipo],
    queryFn: () => listarCategorias(tipo as Escopo),
  });

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter(
      (o) =>
        (!categoria || o.category_id === categoria) &&
        (!termo ||
          [o.title, o.subtitulo, o.local, ...o.tags].some((t) =>
            (t ?? "").toLowerCase().includes(termo),
          )),
    );
  }, [itens, busca, categoria]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar oportunidades..."
            aria-label="Pesquisar oportunidades"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        {categorias.filter((c) => c.active).length > 0 && (
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-full border border-border bg-card px-4 py-3 text-sm"
          >
            <option value="">Todas as categorias</option>
            {categorias
              .filter((c) => c.active)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando oportunidades...</p>}

        {lista.map((o) => (
          <article
            key={o.id}
            className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                {o.featured && (
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase text-primary">
                    Destaque
                  </span>
                )}
                <h2 className="mt-3 text-lg leading-tight">{o.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {[o.subtitulo, o.local].filter(Boolean).join(" • ")}
                </p>
                {o.description && (
                  <p className="mt-2 max-w-2xl text-sm text-foreground/80">{o.description}</p>
                )}
                {o.detalhes.length > 0 && (
                  <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                    {o.detalhes.map((d) => (
                      <div key={d.rotulo} className="flex gap-1">
                        <dt className="text-muted-foreground">{d.rotulo}:</dt>
                        <dd className="font-bold">{d.valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {o.requisitos.length > 0 && (
                  <ul className="mt-3 list-inside list-disc text-sm text-foreground/80">
                    {o.requisitos.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                )}
                {o.prazo && (
                  <p className="mt-2 text-sm text-muted-foreground">Prazo: {o.prazo}</p>
                )}
                {o.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {o.link && (
                <a
                  href={o.link}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft"
                >
                  Ver oportunidade
                </a>
              )}
            </div>
          </article>
        ))}

        {!isLoading && lista.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma oportunidade publicada por aqui.</p>
        )}
      </div>
    </div>
  );
}
