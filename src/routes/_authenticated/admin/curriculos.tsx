import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useAcoes, useLista } from "@/lib/crud";
import { Area, Campo, Marcador, Selecao, UploadArquivo } from "@/components/admin/Campos";
import { listarCategorias } from "@/lib/conteudo";

export const Route = createFileRoute("/_authenticated/admin/curriculos")({
  head: () => ({
    meta: [
      { title: "Modelos de currículo | Conecta Oportunidades" },
      {
        name: "description",
        content: "Cadastre, ordene e recomende modelos de currículo para download dos alunos.",
      },
      { property: "og:title", content: "Modelos de currículo" },
      { property: "og:description", content: "Administração dos modelos de currículo do site." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCurriculos,
});

type Modelo = {
  id: string;
  name: string;
  description: string;
  file_url: string | null;
  preview_url: string | null;
  category_id: string | null;
  active: boolean;
  recommended: boolean;
  position: number;
};

const vazio = {
  name: "",
  description: "",
  file_url: "",
  preview_url: "",
  category_id: "",
  active: true,
  recommended: false,
};

function AdminCurriculos() {
  const { data: modelos = [] } = useLista<Modelo>("resume_templates", ["position"]);
  const acoes = useAcoes("resume_templates");
  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias", "curriculo"],
    queryFn: () => listarCategorias("curriculo"),
  });
  const [form, setForm] = useState({ ...vazio });
  const [editando, setEditando] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const valores = {
      name: form.name,
      description: form.description,
      file_url: form.file_url || null,
      preview_url: form.preview_url || null,
      category_id: form.category_id || null,
      active: form.active,
      recommended: form.recommended,
    };
    try {
      if (editando) await acoes.atualizar(editando, valores);
      else await acoes.criar({ ...valores, position: modelos.length + 1 });
      setForm({ ...vazio });
      setEditando(null);
      setMsg("Modelo salvo.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  async function mover(m: Modelo, direcao: -1 | 1) {
    const i = modelos.findIndex((o) => o.id === m.id);
    const vizinho = modelos[i + direcao];
    if (!vizinho) return;
    await acoes.atualizar(m.id, { position: vizinho.position });
    await acoes.atualizar(vizinho.id, { position: m.position });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl">Modelos de currículo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Os modelos ativos aparecem na página “Aprenda a fazer seu currículo”.
        </p>
      </div>

      <form onSubmit={salvar} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editando ? "Editar modelo" : "Novo modelo"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo
            label="Nome"
            obrigatorio
            valor={form.name}
            aoMudar={(v) => setForm({ ...form, name: v })}
          />
          <Selecao
            label="Categoria"
            valor={form.category_id}
            aoMudar={(v) => setForm({ ...form, category_id: v })}
            opcoes={[
              { valor: "", rotulo: "Sem categoria" },
              ...categorias.filter((c) => c.active).map((c) => ({ valor: c.id, rotulo: c.name })),
            ]}
          />
          <Area
            label="Descrição"
            valor={form.description}
            aoMudar={(v) => setForm({ ...form, description: v })}
            className="sm:col-span-2"
          />
          <UploadArquivo
            label="Arquivo para download (PDF ou DOCX)"
            valor={form.file_url}
            aoMudar={(v) => setForm({ ...form, file_url: v })}
            pasta="curriculos"
          />
          <UploadArquivo
            label="Imagem de prévia"
            valor={form.preview_url}
            aoMudar={(v) => setForm({ ...form, preview_url: v })}
            pasta="curriculos"
            accept="image/*"
          />
          <Marcador
            label="Modelo ativo"
            valor={form.active}
            aoMudar={(v) => setForm({ ...form, active: v })}
          />
          <Marcador
            label="Recomendado"
            valor={form.recommended}
            aoMudar={(v) => setForm({ ...form, recommended: v })}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            {editando ? "Salvar modelo" : "Criar modelo"}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null);
                setForm({ ...vazio });
              }}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-bold"
            >
              Cancelar
            </button>
          )}
        </div>
        {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
      </form>

      <ul className="space-y-3">
        {modelos.map((m, i) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5"
          >
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {m.active ? "Ativo" : "Inativo"}
                {m.recommended ? " • recomendado" : ""}
              </p>
              <p className="mt-1 font-bold">{m.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => mover(m, -1)}
                disabled={i === 0}
                aria-label="Mover para cima"
                className="rounded-full border border-border p-2 disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                onClick={() => mover(m, 1)}
                disabled={i === modelos.length - 1}
                aria-label="Mover para baixo"
                className="rounded-full border border-border p-2 disabled:opacity-40"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                onClick={() => acoes.atualizar(m.id, { active: !m.active })}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                {m.active ? "Desativar" : "Ativar"}
              </button>
              <button
                onClick={() => acoes.atualizar(m.id, { recommended: !m.recommended })}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                {m.recommended ? "Tirar recomendação" : "Recomendar"}
              </button>
              <button
                onClick={() => {
                  setEditando(m.id);
                  setForm({
                    name: m.name,
                    description: m.description,
                    file_url: m.file_url ?? "",
                    preview_url: m.preview_url ?? "",
                    category_id: m.category_id ?? "",
                    active: m.active,
                    recommended: m.recommended,
                  });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Excluir o modelo "${m.name}"?`)) acoes.remover(m.id);
                }}
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
        {modelos.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhum modelo cadastrado.</li>
        )}
      </ul>
    </div>
  );
}
