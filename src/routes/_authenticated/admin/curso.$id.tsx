import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Area, Campo, Marcador, Selecao, UploadArquivo } from "@/components/admin/Campos";
import { STATUS, type Status } from "@/lib/conteudo";

export const Route = createFileRoute("/_authenticated/admin/curso/$id")({
  head: () => ({
    meta: [
      { title: "Montar conteúdo do curso | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Crie módulos, aulas, materiais em texto, vídeo, imagem e PDF, além de questionários do curso.",
      },
      { property: "og:title", content: "Montar conteúdo do curso" },
      { property: "og:description", content: "Administração do conteúdo dos cursos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminConteudoCurso,
});

type Modulo = { id: string; title: string; description: string; position: number };

type Aula = {
  id: string;
  module_id: string | null;
  title: string;
  summary: string;
  content: string;
  video_url: string | null;
  position: number;
  duration_min: number;
  required: boolean;
  status: Status;
};

type Bloco = {
  id: string;
  lesson_id: string;
  type: string;
  position: number;
  data: { titulo?: string; texto?: string; url?: string };
};

const TIPOS_BLOCO = [
  { valor: "texto", rotulo: "Texto" },
  { valor: "video", rotulo: "Vídeo" },
  { valor: "imagem", rotulo: "Imagem" },
  { valor: "pdf", rotulo: "PDF / material" },
  { valor: "link", rotulo: "Link externo" },
];

const aulaVazia = {
  module_id: "",
  title: "",
  summary: "",
  content: "",
  video_url: "",
  duration_min: 10,
  required: true,
  status: "publicado" as Status,
};

function AdminConteudoCurso() {
  const { id } = useParams({ from: "/_authenticated/admin/curso/$id" });
  const qc = useQueryClient();
  const recarregar = () => qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("admin-") });
  const [msg, setMsg] = useState("");

  const { data: curso } = useQuery({
    queryKey: ["admin-curso", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ["admin-modulos", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_modules")
        .select("id, title, description, position")
        .eq("course_id", id)
        .order("position");
      if (error) throw error;
      return (data ?? []) as Modulo[];
    },
  });

  const { data: aulas = [] } = useQuery({
    queryKey: ["admin-aulas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select(
          "id, module_id, title, summary, content, video_url, position, duration_min, required, status",
        )
        .eq("course_id", id)
        .order("position");
      if (error) throw error;
      return (data ?? []) as Aula[];
    },
  });

  const [modulo, setModulo] = useState({ title: "", description: "" });
  const [editandoModulo, setEditandoModulo] = useState<string | null>(null);
  const [form, setForm] = useState({ ...aulaVazia });
  const [editandoAula, setEditandoAula] = useState<string | null>(null);
  const [aulaAberta, setAulaAberta] = useState<string | null>(null);

  async function salvarModulo(e: React.FormEvent) {
    e.preventDefault();
    const valores = { title: modulo.title, description: modulo.description, course_id: id };
    const { error } = editandoModulo
      ? await supabase.from("course_modules").update(valores).eq("id", editandoModulo)
      : await supabase
          .from("course_modules")
          .insert({ ...valores, position: modulos.length + 1 });
    if (error) return setMsg(error.message);
    setModulo({ title: "", description: "" });
    setEditandoModulo(null);
    recarregar();
  }

  async function salvarAula(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const valores = {
      course_id: id,
      module_id: form.module_id || null,
      title: form.title,
      summary: form.summary,
      content: form.content,
      video_url: form.video_url || null,
      duration_min: Number(form.duration_min),
      required: form.required,
      status: form.status,
    };
    const { error } = editandoAula
      ? await supabase.from("lessons").update(valores).eq("id", editandoAula)
      : await supabase.from("lessons").insert({ ...valores, position: aulas.length + 1 });
    if (error) return setMsg(error.message);
    setForm({ ...aulaVazia });
    setEditandoAula(null);
    recarregar();
  }

  async function moverAula(aula: Aula, direcao: -1 | 1) {
    const i = aulas.findIndex((a) => a.id === aula.id);
    const vizinha = aulas[i + direcao];
    if (!vizinha) return;
    await Promise.all([
      supabase.from("lessons").update({ position: vizinha.position }).eq("id", aula.id),
      supabase.from("lessons").update({ position: aula.position }).eq("id", vizinha.id),
    ]);
    recarregar();
  }

  return (
    <div className="space-y-10">
      <div>
        <Link to="/admin/cursos" className="text-xs font-bold uppercase text-primary">
          ← Voltar para cursos
        </Link>
        <h1 className="mt-2 text-2xl">Conteúdo de {curso?.title ?? "..."}</h1>
      </div>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">Módulos</h2>
        <form onSubmit={salvarModulo} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo
            label="Nome do módulo"
            obrigatorio
            valor={modulo.title}
            aoMudar={(v) => setModulo({ ...modulo, title: v })}
          />
          <Campo
            label="Descrição"
            valor={modulo.description}
            aoMudar={(v) => setModulo({ ...modulo, description: v })}
          />
          <div className="flex gap-3 sm:col-span-2">
            <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
              {editandoModulo ? "Salvar módulo" : "Adicionar módulo"}
            </button>
            {editandoModulo && (
              <button
                type="button"
                onClick={() => {
                  setEditandoModulo(null);
                  setModulo({ title: "", description: "" });
                }}
                className="rounded-full border border-border px-6 py-2.5 text-sm font-bold"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
        <ul className="mt-5 space-y-2">
          {modulos.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border px-5 py-3"
            >
              <div>
                <p className="font-bold">{m.title}</p>
                {m.description && (
                  <p className="text-sm text-muted-foreground">{m.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditandoModulo(m.id);
                    setModulo({ title: m.title, description: m.description });
                  }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Excluir o módulo "${m.title}"?`)) return;
                    await supabase.from("course_modules").delete().eq("id", m.id);
                    recarregar();
                  }}
                  className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
          {modulos.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Nenhum módulo criado — as aulas aparecem em lista única.
            </li>
          )}
        </ul>
      </section>

      <form onSubmit={salvarAula} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editandoAula ? "Editar aula" : "Nova aula"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo
            label="Título"
            obrigatorio
            valor={form.title}
            aoMudar={(v) => setForm({ ...form, title: v })}
          />
          <Selecao
            label="Módulo"
            valor={form.module_id}
            aoMudar={(v) => setForm({ ...form, module_id: v })}
            opcoes={[
              { valor: "", rotulo: "Sem módulo" },
              ...modulos.map((m) => ({ valor: m.id, rotulo: m.title })),
            ]}
          />
          <Campo
            label="Resumo curto"
            valor={form.summary}
            aoMudar={(v) => setForm({ ...form, summary: v })}
            className="sm:col-span-2"
          />
          <Area
            label="Conteúdo principal"
            linhas={5}
            valor={form.content}
            aoMudar={(v) => setForm({ ...form, content: v })}
            className="sm:col-span-2"
          />
          <UploadArquivo
            label="Vídeo ou material principal"
            valor={form.video_url}
            aoMudar={(v) => setForm({ ...form, video_url: v })}
            pasta="aulas"
          />
          <Campo
            label="Duração (min)"
            tipo="number"
            valor={form.duration_min}
            aoMudar={(v) => setForm({ ...form, duration_min: Number(v) })}
          />
          <Selecao
            label="Status"
            valor={form.status}
            aoMudar={(v) => setForm({ ...form, status: v as Status })}
            opcoes={STATUS.map((s) => ({ valor: s.valor, rotulo: s.rotulo }))}
          />
          <Marcador
            label="Aula obrigatória (conta no progresso)"
            valor={form.required}
            aoMudar={(v) => setForm({ ...form, required: v })}
          />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            {editandoAula ? "Salvar aula" : "Adicionar aula"}
          </button>
          {editandoAula && (
            <button
              type="button"
              onClick={() => {
                setEditandoAula(null);
                setForm({ ...aulaVazia });
              }}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-bold"
            >
              Cancelar
            </button>
          )}
        </div>
        {msg && <p className="mt-4 text-sm text-destructive">{msg}</p>}
      </form>

      <ul className="space-y-3">
        {aulas.map((a, i) => (
          <li key={a.id} className="rounded-3xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Aula {a.position} • {a.duration_min} min • {a.status}
                  {a.required ? " • obrigatória" : " • opcional"}
                  {a.module_id
                    ? ` • ${modulos.find((m) => m.id === a.module_id)?.title ?? "módulo"}`
                    : ""}
                </p>
                <p className="mt-1 font-bold">{a.title}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => moverAula(a, -1)}
                  disabled={i === 0}
                  aria-label="Mover aula para cima"
                  className="rounded-full border border-border p-2 disabled:opacity-40"
                >
                  <ArrowUp className="size-4" />
                </button>
                <button
                  onClick={() => moverAula(a, 1)}
                  disabled={i === aulas.length - 1}
                  aria-label="Mover aula para baixo"
                  className="rounded-full border border-border p-2 disabled:opacity-40"
                >
                  <ArrowDown className="size-4" />
                </button>
                <button
                  onClick={() => setAulaAberta(aulaAberta === a.id ? null : a.id)}
                  className="rounded-full border border-primary px-3 py-1.5 text-xs font-bold text-primary"
                >
                  Materiais
                </button>
                <button
                  onClick={() => {
                    setEditandoAula(a.id);
                    setForm({
                      module_id: a.module_id ?? "",
                      title: a.title,
                      summary: a.summary ?? "",
                      content: a.content,
                      video_url: a.video_url ?? "",
                      duration_min: a.duration_min,
                      required: a.required,
                      status: a.status,
                    });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
                >
                  Editar
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Remover a aula "${a.title}"?`)) return;
                    await supabase.from("lessons").delete().eq("id", a.id);
                    recarregar();
                  }}
                  className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
                >
                  Remover
                </button>
              </div>
            </div>
            {aulaAberta === a.id && <Blocos lessonId={a.id} aoMudar={recarregar} />}
          </li>
        ))}
        {aulas.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhuma aula cadastrada.</li>
        )}
      </ul>
    </div>
  );
}

function Blocos({ lessonId, aoMudar }: { lessonId: string; aoMudar: () => void }) {
  const qc = useQueryClient();
  const [novo, setNovo] = useState({ type: "texto", titulo: "", texto: "", url: "" });

  const { data: blocos = [] } = useQuery({
    queryKey: ["admin-blocos", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_blocks")
        .select("id, lesson_id, type, position, data")
        .eq("lesson_id", lessonId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as unknown as Bloco[];
    },
  });

  const recarregar = () => {
    qc.invalidateQueries({ queryKey: ["admin-blocos", lessonId] });
    aoMudar();
  };

  async function adicionar(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("lesson_blocks").insert({
      lesson_id: lessonId,
      type: novo.type,
      position: blocos.length + 1,
      data: { titulo: novo.titulo, texto: novo.texto, url: novo.url },
    });
    setNovo({ type: novo.type, titulo: "", texto: "", url: "" });
    recarregar();
  }

  return (
    <div className="mt-5 rounded-2xl border border-border p-5">
      <h3 className="text-sm font-bold uppercase text-muted-foreground">Materiais da aula</h3>

      <form onSubmit={adicionar} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Selecao
          label="Tipo de material"
          valor={novo.type}
          aoMudar={(v) => setNovo({ ...novo, type: v })}
          opcoes={TIPOS_BLOCO}
        />
        <Campo
          label="Título"
          valor={novo.titulo}
          aoMudar={(v) => setNovo({ ...novo, titulo: v })}
        />
        {novo.type === "texto" ? (
          <Area
            label="Texto"
            linhas={4}
            valor={novo.texto}
            aoMudar={(v) => setNovo({ ...novo, texto: v })}
            className="sm:col-span-2"
          />
        ) : (
          <UploadArquivo
            label="Arquivo ou link"
            valor={novo.url}
            aoMudar={(v) => setNovo({ ...novo, url: v })}
            pasta="aulas"
            className="sm:col-span-2"
          />
        )}
        <div className="sm:col-span-2">
          <button className="rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground">
            Adicionar material
          </button>
        </div>
      </form>

      <ul className="mt-4 space-y-2">
        {blocos.map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-2 text-sm"
          >
            <span>
              <strong className="capitalize">{b.type}</strong>
              {b.data?.titulo ? ` • ${b.data.titulo}` : ""}
            </span>
            <button
              onClick={async () => {
                await supabase.from("lesson_blocks").delete().eq("id", b.id);
                recarregar();
              }}
              className="rounded-full border border-border px-3 py-1 text-xs font-bold text-destructive"
            >
              Remover
            </button>
          </li>
        ))}
        {blocos.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhum material extra nesta aula.</li>
        )}
      </ul>
    </div>
  );
}
