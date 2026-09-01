import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/curso/$id")({
  head: () => ({
    meta: [
      { title: "Gerenciar aulas do curso | Conecta Oportunidades" },
      {
        name: "description",
        content: "Crie, edite, ordene e remova as aulas de um curso do ConectAção.",
      },
      { property: "og:title", content: "Gerenciar aulas do curso" },
      { property: "og:description", content: "Administração do conteúdo dos cursos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAulas,
});

type Aula = {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  position: number;
  duration_min: number;
  required: boolean;
  status: "rascunho" | "publicado";
};

const vazio = {
  title: "",
  content: "",
  video_url: "",
  duration_min: 10,
  required: true,
  status: "publicado" as "rascunho" | "publicado",
};

function AdminAulas() {
  const { id } = useParams({ from: "/_authenticated/admin/curso/$id" });
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...vazio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
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

  const { data: aulas = [] } = useQuery({
    queryKey: ["admin-aulas", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, content, video_url, position, duration_min, required, status")
        .eq("course_id", id)
        .order("position");
      if (error) throw error;
      return (data ?? []) as Aula[];
    },
  });

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const payload = {
      course_id: id,
      title: form.title,
      content: form.content,
      video_url: form.video_url || null,
      duration_min: Number(form.duration_min),
      required: form.required,
      status: form.status,
    };
    const { error } = editandoId
      ? await supabase.from("lessons").update(payload).eq("id", editandoId)
      : await supabase
          .from("lessons")
          .insert({ ...payload, position: (aulas.at(-1)?.position ?? 0) + 1 });
    if (error) return setMsg(error.message);
    setForm({ ...vazio });
    setEditandoId(null);
    qc.invalidateQueries({ queryKey: ["admin-aulas", id] });
  }

  async function mover(aula: Aula, direcao: -1 | 1) {
    const indice = aulas.findIndex((a) => a.id === aula.id);
    const vizinha = aulas[indice + direcao];
    if (!vizinha) return;
    await Promise.all([
      supabase.from("lessons").update({ position: vizinha.position }).eq("id", aula.id),
      supabase.from("lessons").update({ position: aula.position }).eq("id", vizinha.id),
    ]);
    qc.invalidateQueries({ queryKey: ["admin-aulas", id] });
  }

  async function remover(aula: Aula) {
    if (!window.confirm(`Remover a aula "${aula.title}"?`)) return;
    const { error } = await supabase.from("lessons").delete().eq("id", aula.id);
    if (error) setMsg(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-aulas", id] });
  }

  const campo = "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm";

  return (
    <div className="space-y-8">
      <div>
        <Link to="/admin/cursos" className="text-xs font-bold uppercase text-primary">
          ← Voltar para cursos
        </Link>
        <h1 className="mt-2 text-2xl">Aulas de {curso?.title ?? "..."}</h1>
      </div>

      <form onSubmit={salvar} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editandoId ? "Editar aula" : "Nova aula"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Título
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm">
            Duração (min)
            <input
              type="number"
              min={1}
              value={form.duration_min}
              onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })}
              className={campo}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Conteúdo
            <textarea
              rows={4}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm">
            Vídeo/material (URL)
            <input
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm">
            Status
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "rascunho" | "publicado" })
              }
              className={campo}
            >
              <option value="publicado">Publicado</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.required}
              onChange={(e) => setForm({ ...form, required: e.target.checked })}
            />
            Aula obrigatória (conta no progresso)
          </label>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            {editandoId ? "Salvar aula" : "Adicionar aula"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={() => {
                setEditandoId(null);
                setForm({ ...vazio });
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
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5"
          >
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Aula {a.position} • {a.duration_min} min • {a.status}
                {a.required ? " • obrigatória" : " • opcional"}
              </p>
              <p className="mt-1 font-bold">{a.title}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => mover(a, -1)}
                disabled={i === 0}
                aria-label="Mover aula para cima"
                className="rounded-full border border-border p-2 disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </button>
              <button
                onClick={() => mover(a, 1)}
                disabled={i === aulas.length - 1}
                aria-label="Mover aula para baixo"
                className="rounded-full border border-border p-2 disabled:opacity-40"
              >
                <ArrowDown className="size-4" />
              </button>
              <button
                onClick={() => {
                  setEditandoId(a.id);
                  setForm({
                    title: a.title,
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
                onClick={() => remover(a)}
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
        {aulas.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhuma aula cadastrada.</li>
        )}
      </ul>
    </div>
  );
}
