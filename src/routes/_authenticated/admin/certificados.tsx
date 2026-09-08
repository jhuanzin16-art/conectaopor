import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAcoes, useLista } from "@/lib/crud";
import { Area, Campo, Marcador, UploadArquivo } from "@/components/admin/Campos";

export const Route = createFileRoute("/_authenticated/admin/certificados")({
  head: () => ({
    meta: [
      { title: "Modelos de certificado | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Cadastre modelos de certificado, defina o modelo padrão e a posição dos dados do aluno.",
      },
      { property: "og:title", content: "Modelos de certificado" },
      { property: "og:description", content: "Administração dos certificados emitidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCertificados,
});

type Posicao = { x: number; y: number; tamanho: number };
type Campos = Record<string, Posicao>;

function posicao(campos: Campos, chave: string): Posicao {
  return campos[chave] ?? padraoCampos[chave] ?? { x: 50, y: 50, tamanho: 16 };
}

type Modelo = {
  id: string;
  name: string;
  description: string;
  file_url: string | null;
  file_type: string;
  active: boolean;
  is_default: boolean;
  fields: Campos;
};

const CAMPOS_AUTOMATICOS = [
  { chave: "aluno", rotulo: "Nome do aluno" },
  { chave: "curso", rotulo: "Nome do curso" },
  { chave: "horas", rotulo: "Carga horária" },
  { chave: "data", rotulo: "Data de conclusão" },
  { chave: "codigo", rotulo: "Código do certificado" },
];

const padraoCampos: Campos = {
  aluno: { x: 50, y: 45, tamanho: 28 },
  curso: { x: 50, y: 58, tamanho: 20 },
  horas: { x: 50, y: 68, tamanho: 14 },
  data: { x: 50, y: 76, tamanho: 14 },
  codigo: { x: 50, y: 90, tamanho: 12 },
};

const vazio = {
  name: "",
  description: "",
  file_url: "",
  file_type: "png",
  active: true,
  is_default: false,
  fields: padraoCampos,
};

function AdminCertificados() {
  const { data: modelos = [] } = useLista<Modelo>("certificate_templates", ["created_at"]);
  const acoes = useAcoes("certificate_templates");
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
      file_type: form.file_url?.toLowerCase().endsWith(".pdf") ? "pdf" : "imagem",
      active: form.active,
      is_default: form.is_default,
      fields: form.fields,
    };
    try {
      if (form.is_default) {
        await Promise.all(
          modelos.filter((m) => m.is_default && m.id !== editando).map((m) =>
            acoes.atualizar(m.id, { is_default: false }),
          ),
        );
      }
      if (editando) await acoes.atualizar(editando, valores);
      else await acoes.criar(valores);
      setForm({ ...vazio });
      setEditando(null);
      setMsg("Modelo salvo.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  }

  function ajustarCampo(chave: string, prop: "x" | "y" | "tamanho", valor: number) {
    setForm({
      ...form,
      fields: {
        ...form.fields,
        [chave]: { ...posicao(form.fields, chave), [prop]: valor },
      },
    });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Modelos de certificado</h1>

      <form onSubmit={salvar} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editando ? "Editar modelo" : "Novo modelo"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo
            label="Nome do modelo"
            obrigatorio
            valor={form.name}
            aoMudar={(v) => setForm({ ...form, name: v })}
          />
          <UploadArquivo
            label="Arquivo do modelo (PNG, JPG ou PDF)"
            valor={form.file_url}
            aoMudar={(v) => setForm({ ...form, file_url: v })}
            pasta="certificados"
            accept="image/png,image/jpeg,application/pdf"
          />
          <Area
            label="Descrição"
            valor={form.description}
            aoMudar={(v) => setForm({ ...form, description: v })}
            className="sm:col-span-2"
          />
          <Marcador
            label="Modelo ativo"
            valor={form.active}
            aoMudar={(v) => setForm({ ...form, active: v })}
          />
          <Marcador
            label="Usar como modelo padrão"
            valor={form.is_default}
            aoMudar={(v) => setForm({ ...form, is_default: v })}
          />
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-bold uppercase text-muted-foreground">
            Posição dos dados automáticos
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Os valores são em porcentagem do certificado: 0% é o topo/esquerda e 100% a
            base/direita.
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              {CAMPOS_AUTOMATICOS.map((c) => {
                const v = posicao(form.fields, c.chave);
                return (
                  <div key={c.chave} className="rounded-2xl border border-border p-4">
                    <p className="text-sm font-bold">{c.rotulo}</p>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                      <Campo
                        label="Horizontal %"
                        tipo="number"
                        valor={v.x}
                        aoMudar={(val) => ajustarCampo(c.chave, "x", Number(val))}
                      />
                      <Campo
                        label="Vertical %"
                        tipo="number"
                        valor={v.y}
                        aoMudar={(val) => ajustarCampo(c.chave, "y", Number(val))}
                      />
                      <Campo
                        label="Tamanho"
                        tipo="number"
                        valor={v.tamanho}
                        aoMudar={(val) => ajustarCampo(c.chave, "tamanho", Number(val))}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="relative aspect-[1.414/1] overflow-hidden rounded-2xl border border-border bg-muted">
              {form.file_url && !form.file_url.toLowerCase().endsWith(".pdf") && (
                <img
                  src={form.file_url}
                  alt="Prévia do modelo de certificado"
                  className="absolute inset-0 size-full object-cover"
                />
              )}
              {CAMPOS_AUTOMATICOS.map((c) => {
                const v = posicao(form.fields, c.chave);
                const exemplo: Record<string, string> = {
                  aluno: "Nome do Aluno",
                  curso: "Nome do Curso",
                  horas: "20 horas",
                  data: "01/01/2026",
                  codigo: "CA-EXEMPLO123",
                };
                return (
                  <span
                    key={c.chave}
                    style={{
                      left: `${v.x}%`,
                      top: `${v.y}%`,
                      fontSize: `${v.tamanho / 2}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    className="absolute whitespace-nowrap font-bold text-foreground"
                  >
                    {exemplo[c.chave]}
                  </span>
                );
              })}
            </div>
          </div>
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
        {modelos.map((m) => (
          <li
            key={m.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5"
          >
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {m.active ? "Ativo" : "Inativo"}
                {m.is_default ? " • padrão" : ""}
              </p>
              <p className="mt-1 font-bold">{m.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => acoes.atualizar(m.id, { active: !m.active })}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                {m.active ? "Desativar" : "Ativar"}
              </button>
              <button
                onClick={async () => {
                  await Promise.all(
                    modelos.filter((o) => o.is_default).map((o) => acoes.atualizar(o.id, { is_default: false })),
                  );
                  await acoes.atualizar(m.id, { is_default: true });
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Tornar padrão
              </button>
              <button
                onClick={() => {
                  setEditando(m.id);
                  setForm({
                    name: m.name,
                    description: m.description,
                    file_url: m.file_url ?? "",
                    file_type: m.file_type,
                    active: m.active,
                    is_default: m.is_default,
                    fields: { ...padraoCampos, ...(m.fields ?? {}) },
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
