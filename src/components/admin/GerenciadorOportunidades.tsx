import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useAcoes, useLista } from "@/lib/crud";
import {
  Area,
  Campo,
  EtiquetaStatus,
  Marcador,
  Selecao,
  SeletorEtiquetas,
  UploadArquivo,
} from "@/components/admin/Campos";
import {
  listarCategorias,
  listarEtiquetas,
  STATUS,
  type Escopo,
  type Status,
} from "@/lib/conteudo";

export type CampoConfig = {
  chave: string;
  rotulo: string;
  tipo?: "text" | "number" | "date" | "url" | "area";
  largura?: "meia" | "inteira";
};

export type RegistroOportunidade = {
  id: string;
  title: string;
  description: string;
  status: Status;
  featured: boolean;
  category_id: string | null;
  tags: string[];
  image_url: string | null;
  position: number;
  published_at: string | null;
  [k: string]: unknown;
};

type Tabela = "job_openings" | "public_exams" | "internships";

export function GerenciadorOportunidades({
  tabela,
  escopo,
  titulo,
  subtitulo,
  campos,
  padrao,
}: {
  tabela: Tabela;
  escopo: Escopo;
  titulo: string;
  subtitulo: string;
  campos: CampoConfig[];
  padrao: Record<string, unknown>;
}) {
  const { data: registros = [] } = useLista<RegistroOportunidade>(tabela, ["position"]);
  const acoes = useAcoes(tabela);
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias", escopo],
    queryFn: () => listarCategorias(escopo),
  });
  const { data: etiquetas = [] } = useQuery({ queryKey: ["etiquetas"], queryFn: listarEtiquetas });

  const base = useMemo(
    () => ({
      title: "",
      description: "",
      status: "rascunho" as Status,
      featured: false,
      category_id: "",
      tags: [] as string[],
      image_url: "",
      ...padrao,
    }),
    [padrao],
  );

  const [form, setForm] = useState<Record<string, unknown>>({ ...base });
  const [editando, setEditando] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [msg, setMsg] = useState("");

  const visiveis = registros.filter(
    (r) =>
      (!filtroStatus || r.status === filtroStatus) &&
      (!busca || r.title.toLowerCase().includes(busca.toLowerCase())),
  );

  function limpar() {
    setForm({ ...base });
    setEditando(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const valores: Record<string, unknown> = {
      ...form,
      category_id: form.category_id || null,
      image_url: form.image_url || null,
      published_at: form.status === "publicado" ? new Date().toISOString() : null,
    };
    for (const c of campos) {
      if (c.tipo === "date") valores[c.chave] = (form[c.chave] as string) || null;
      if (c.tipo === "url") valores[c.chave] = (form[c.chave] as string) || null;
      if (c.tipo === "number") valores[c.chave] = Number(form[c.chave] ?? 0);
    }
    try {
      if (editando) await acoes.atualizar(editando, valores);
      else await acoes.criar({ ...valores, position: registros.length + 1 });
      limpar();
      setMsg("Salvo com sucesso.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  async function mover(reg: RegistroOportunidade, direcao: -1 | 1) {
    const i = registros.findIndex((r) => r.id === reg.id);
    const vizinho = registros[i + direcao];
    if (!vizinho) return;
    await acoes.atualizar(reg.id, { position: vizinho.position });
    await acoes.atualizar(vizinho.id, { position: reg.position });
  }

  function editar(r: RegistroOportunidade) {
    const dados: Record<string, unknown> = {
      title: r.title,
      description: r.description,
      status: r.status,
      featured: r.featured,
      category_id: r.category_id ?? "",
      tags: r.tags ?? [],
      image_url: r.image_url ?? "",
    };
    for (const c of campos) dados[c.chave] = (r[c.chave] as string | number | null) ?? "";
    setForm(dados);
    setEditando(r.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>
      </div>

      <form onSubmit={salvar} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editando ? "Editar publicação" : "Nova publicação"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo
            label="Título"
            obrigatorio
            valor={form.title as string}
            aoMudar={(v) => setForm({ ...form, title: v })}
          />
          <Selecao
            label="Categoria"
            valor={form.category_id as string}
            aoMudar={(v) => setForm({ ...form, category_id: v })}
            opcoes={[
              { valor: "", rotulo: "Sem categoria" },
              ...categorias.filter((c) => c.active).map((c) => ({ valor: c.id, rotulo: c.name })),
            ]}
          />
          <Area
            label="Descrição"
            linhas={4}
            valor={form.description as string}
            aoMudar={(v) => setForm({ ...form, description: v })}
            className="sm:col-span-2"
          />

          {campos.map((c) =>
            c.tipo === "area" ? (
              <Area
                key={c.chave}
                label={c.rotulo}
                linhas={4}
                dica="Um item por linha"
                valor={(form[c.chave] as string) ?? ""}
                aoMudar={(v) => setForm({ ...form, [c.chave]: v })}
                className={c.largura === "inteira" ? "sm:col-span-2" : ""}
              />
            ) : (
              <Campo
                key={c.chave}
                label={c.rotulo}
                tipo={c.tipo ?? "text"}
                valor={(form[c.chave] as string) ?? ""}
                aoMudar={(v) => setForm({ ...form, [c.chave]: v })}
                className={c.largura === "inteira" ? "sm:col-span-2" : ""}
              />
            ),
          )}

          <UploadArquivo
            label="Imagem de destaque"
            valor={(form.image_url as string) ?? ""}
            aoMudar={(v) => setForm({ ...form, image_url: v })}
            pasta={escopo}
            accept="image/*"
          />
          <Selecao
            label="Status"
            valor={form.status as string}
            aoMudar={(v) => setForm({ ...form, status: v as Status })}
            opcoes={STATUS.map((s) => ({ valor: s.valor, rotulo: s.rotulo }))}
          />
          <SeletorEtiquetas
            etiquetas={etiquetas.filter((t) => t.active)}
            selecionadas={(form.tags as string[]) ?? []}
            aoMudar={(v) => setForm({ ...form, tags: v })}
            className="sm:col-span-2"
          />
          <Marcador
            label="Destacar na página inicial"
            valor={Boolean(form.featured)}
            aoMudar={(v) => setForm({ ...form, featured: v })}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            {editando ? "Salvar alterações" : "Publicar"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={limpar}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-bold"
            >
              Cancelar
            </button>
          )}
        </div>
        {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
      </form>

      <div className="flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar pelo título"
          aria-label="Buscar publicações"
          className="min-w-[220px] flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          aria-label="Filtrar por status"
          className="rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
        >
          <option value="">Todos os status</option>
          {STATUS.map((s) => (
            <option key={s.valor} value={s.valor}>
              {s.rotulo}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-3">
        {visiveis.map((r, i) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <EtiquetaStatus status={r.status} />
                {r.featured && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    destaque
                  </span>
                )}
              </div>
              <p className="mt-2 font-bold">{r.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => mover(r, -1)}
                disabled={i === 0}
                aria-label="Mover para cima"
                className="rounded-full border border-border p-2 disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                onClick={() => mover(r, 1)}
                disabled={i === visiveis.length - 1}
                aria-label="Mover para baixo"
                className="rounded-full border border-border p-2 disabled:opacity-40"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                onClick={() =>
                  acoes.atualizar(r.id, {
                    status: r.status === "publicado" ? "desativado" : "publicado",
                    published_at: r.status === "publicado" ? null : new Date().toISOString(),
                  })
                }
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                {r.status === "publicado" ? "Despublicar" : "Publicar"}
              </button>
              <button
                onClick={() => acoes.atualizar(r.id, { featured: !r.featured })}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                {r.featured ? "Tirar destaque" : "Destacar"}
              </button>
              <button
                onClick={() =>
                  acoes.duplicar(r, {
                    title: `${r.title} (cópia)`,
                    status: "rascunho",
                    published_at: null,
                    position: registros.length + 1,
                  })
                }
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Duplicar
              </button>
              <button
                onClick={() => editar(r)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Editar
              </button>
              <button
                onClick={() => acoes.atualizar(r.id, { status: "arquivado" })}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Arquivar
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Excluir "${r.title}" definitivamente?`)) acoes.remover(r.id);
                }}
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {visiveis.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhuma publicação encontrada.</li>
        )}
      </ul>
    </div>
  );
}
