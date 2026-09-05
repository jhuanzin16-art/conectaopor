import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useAcoes, useLista } from "@/lib/crud";
import { Campo, Marcador, Selecao } from "@/components/admin/Campos";
import { ESCOPOS, slugify, type Categoria, type Etiqueta } from "@/lib/conteudo";

export const Route = createFileRoute("/_authenticated/admin/categorias")({
  head: () => ({
    meta: [
      { title: "Categorias e etiquetas | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Crie, ordene, ative e remova as categorias e etiquetas usadas em cursos, vagas, concursos e estágios.",
      },
      { property: "og:title", content: "Categorias e etiquetas" },
      { property: "og:description", content: "Organização do conteúdo do Conecta Oportunidades." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCategorias,
});

function AdminCategorias() {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl">Categorias e etiquetas</h1>
      <Categorias />
      <Etiquetas />
    </div>
  );
}

function Categorias() {
  const { data: categorias = [] } = useLista<Categoria>("content_categories", ["scope", "position"]);
  const acoes = useAcoes("content_categories");
  const [form, setForm] = useState({ name: "", scope: "curso", parent_id: "", active: true });
  const [editando, setEditando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const valores = {
      name: form.name,
      slug: slugify(form.name),
      scope: form.scope,
      parent_id: form.parent_id || null,
      active: form.active,
    };
    try {
      if (editando) await acoes.atualizar(editando, valores);
      else
        await acoes.criar({
          ...valores,
          position: categorias.filter((c) => c.scope === form.scope).length + 1,
        });
      setForm({ name: "", scope: form.scope, parent_id: "", active: true });
      setEditando(null);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  async function mover(cat: Categoria, direcao: -1 | 1) {
    const irmas = categorias.filter((c) => c.scope === cat.scope);
    const i = irmas.findIndex((c) => c.id === cat.id);
    const vizinha = irmas[i + direcao];
    if (!vizinha) return;
    await acoes.atualizar(cat.id, { position: vizinha.position });
    await acoes.atualizar(vizinha.id, { position: cat.position });
  }

  return (
    <section className="space-y-5">
      <form onSubmit={salvar} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editando ? "Editar categoria" : "Nova categoria"}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Campo
            label="Nome"
            obrigatorio
            valor={form.name}
            aoMudar={(v) => setForm({ ...form, name: v })}
          />
          <Selecao
            label="Onde é usada"
            valor={form.scope}
            aoMudar={(v) => setForm({ ...form, scope: v })}
            opcoes={ESCOPOS.map((e) => ({ valor: e.valor, rotulo: e.rotulo }))}
          />
          <Selecao
            label="Subcategoria de"
            valor={form.parent_id}
            aoMudar={(v) => setForm({ ...form, parent_id: v })}
            opcoes={[
              { valor: "", rotulo: "Categoria principal" },
              ...categorias
                .filter((c) => c.scope === form.scope && c.id !== editando)
                .map((c) => ({ valor: c.id, rotulo: c.name })),
            ]}
          />
          <Marcador
            label="Ativa"
            valor={form.active}
            aoMudar={(v) => setForm({ ...form, active: v })}
            className="mt-6"
          />
        </div>
        <div className="mt-5 flex gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            {editando ? "Salvar categoria" : "Criar categoria"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setForm({ name: "", scope: "curso", parent_id: "", active: true });
              }}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-bold"
            >
              Cancelar
            </button>
          )}
        </div>
        {msg && <p className="mt-3 text-sm text-destructive">{msg}</p>}
      </form>

      <ul className="space-y-2">
        {categorias.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-3"
          >
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {ESCOPOS.find((e) => e.valor === c.scope)?.rotulo ?? c.scope}
                {c.parent_id
                  ? ` • dentro de ${categorias.find((p) => p.id === c.parent_id)?.name ?? "—"}`
                  : ""}
                {c.active ? "" : " • inativa"}
              </p>
              <p className="font-bold">{c.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <BotaoIcone rotulo="Subir" onClick={() => mover(c, -1)}>
                <ArrowUp className="size-4" />
              </BotaoIcone>
              <BotaoIcone rotulo="Descer" onClick={() => mover(c, 1)}>
                <ArrowDown className="size-4" />
              </BotaoIcone>
              <button
                onClick={() => acoes.atualizar(c.id, { active: !c.active })}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                {c.active ? "Desativar" : "Ativar"}
              </button>
              <button
                onClick={() => {
                  setEditando(c.id);
                  setForm({
                    name: c.name,
                    scope: c.scope,
                    parent_id: c.parent_id ?? "",
                    active: c.active,
                  });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Excluir a categoria "${c.name}"?`)) acoes.remover(c.id);
                }}
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {categorias.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhuma categoria cadastrada.</li>
        )}
      </ul>
    </section>
  );
}

function Etiquetas() {
  const { data: etiquetas = [] } = useLista<Etiqueta>("content_tags", ["position"]);
  const acoes = useAcoes("content_tags");
  const [nome, setNome] = useState("");

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    await acoes.criar({ name: nome, slug: slugify(nome), position: etiquetas.length + 1 });
    setNome("");
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="text-lg">Etiquetas</h2>
      <form onSubmit={criar} className="mt-4 flex flex-wrap items-end gap-3">
        <Campo label="Nova etiqueta" valor={nome} aoMudar={setNome} className="min-w-[220px]" />
        <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
          Adicionar
        </button>
      </form>
      <div className="mt-5 flex flex-wrap gap-2">
        {etiquetas.map((t) => (
          <span
            key={t.id}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
              t.active ? "border-primary text-primary" : "border-border text-muted-foreground"
            }`}
          >
            {t.name}
            <button
              onClick={() => acoes.atualizar(t.id, { active: !t.active })}
              className="underline"
            >
              {t.active ? "desativar" : "ativar"}
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Excluir a etiqueta "${t.name}"?`)) acoes.remover(t.id);
              }}
              className="text-destructive underline"
            >
              excluir
            </button>
          </span>
        ))}
        {etiquetas.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma etiqueta cadastrada.</p>
        )}
      </div>
    </section>
  );
}

function BotaoIcone({
  rotulo,
  onClick,
  children,
}: {
  rotulo: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={rotulo}
      className="rounded-full border border-border p-2 text-muted-foreground"
    >
      {children}
    </button>
  );
}
