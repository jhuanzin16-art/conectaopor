import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRoles } from "@/lib/roles";
import { CURSO_FIELDS, listarCategorias, slugify, type CursoDB, type Nivel } from "@/lib/cursos-db";

export const Route = createFileRoute("/_authenticated/admin/cursos")({
  head: () => ({
    meta: [
      { title: "Gerenciar cursos | Conecta Oportunidades" },
      {
        name: "description",
        content: "Crie, edite e publique cursos próprios e cursos externos do ConectAção.",
      },
      { property: "og:title", content: "Gerenciar cursos" },
      { property: "og:description", content: "Administração de cursos do ConectAção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminCursos,
});

const vazio = {
  title: "",
  description: "",
  cover_url: "",
  category_id: "",
  level: "iniciante" as Nivel,
  hours: 10,
  instructor: "ConectAção",
  status: "rascunho" as "rascunho" | "publicado",
  is_external: false,
  platform: "",
  external_url: "",
};

function AdminCursos() {
  const { user } = useAuth();
  const { isSuperAdmin } = useRoles();
  const qc = useQueryClient();
  const [form, setForm] = useState({ ...vazio });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const { data: cursos = [] } = useQuery({
    queryKey: ["admin-cursos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select(CURSO_FIELDS)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CursoDB[];
    },
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ["categorias"],
    queryFn: listarCategorias,
  });

  function editar(c: CursoDB) {
    setEditandoId(c.id);
    setForm({
      title: c.title,
      description: c.description,
      cover_url: c.cover_url ?? "",
      category_id: c.category_id ?? "",
      level: c.level,
      hours: Number(c.hours),
      instructor: c.instructor,
      status: c.status,
      is_external: c.is_external,
      platform: c.platform ?? "",
      external_url: c.external_url ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const payload = {
      title: form.title,
      slug: slugify(form.title),
      description: form.description,
      cover_url: form.cover_url || null,
      category_id: form.category_id || null,
      level: form.level,
      hours: Number(form.hours),
      instructor: form.instructor,
      status: form.status,
      is_external: form.is_external,
      platform: form.is_external ? form.platform || null : null,
      external_url: form.is_external ? form.external_url || null : null,
      created_by: user?.id ?? null,
    };

    const { error } = editandoId
      ? await supabase.from("courses").update(payload).eq("id", editandoId)
      : await supabase.from("courses").insert(payload);

    if (error) return setMsg(error.message);
    setMsg(editandoId ? "Curso atualizado." : "Curso criado.");
    setForm({ ...vazio });
    setEditandoId(null);
    qc.invalidateQueries({ queryKey: ["admin-cursos"] });
  }

  async function excluir(c: CursoDB) {
    if (!window.confirm(`Excluir definitivamente o curso "${c.title}"?`)) return;
    const { error } = await supabase.from("courses").delete().eq("id", c.id);
    if (error) setMsg(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-cursos"] });
  }

  const campo = "w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Cursos</h1>

      <form onSubmit={salvar} className="rounded-3xl border border-border bg-card p-6">
        <h2 className="text-lg">{editandoId ? "Editar curso" : "Novo curso"}</h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            Nome
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm">
            Instrutor
            <input
              value={form.instructor}
              onChange={(e) => setForm({ ...form, instructor: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm sm:col-span-2">
            Descrição
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm">
            Imagem/capa (URL)
            <input
              value={form.cover_url}
              onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              className={campo}
            />
          </label>
          <label className="text-sm">
            Categoria
            <select
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className={campo}
            >
              <option value="">Sem categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Nível
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value as Nivel })}
              className={campo}
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </label>
          <label className="text-sm">
            Carga horária
            <input
              type="number"
              min={0}
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
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
              <option value="rascunho">Rascunho</option>
              <option value="publicado">Publicado</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_external}
              onChange={(e) => setForm({ ...form, is_external: e.target.checked })}
            />
            Curso externo (não emite certificado)
          </label>
          {form.is_external && (
            <>
              <label className="text-sm">
                Plataforma
                <input
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className={campo}
                />
              </label>
              <label className="text-sm">
                Link externo
                <input
                  type="url"
                  value={form.external_url}
                  onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                  className={campo}
                />
              </label>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            {editandoId ? "Salvar alterações" : "Criar curso"}
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
        {msg && <p className="mt-4 text-sm text-muted-foreground">{msg}</p>}
      </form>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Curso</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-4 font-bold">{c.title}</td>
                <td className="p-4 text-muted-foreground">
                  {c.is_external ? `Externo (${c.platform ?? "—"})` : "ConectAção"}
                </td>
                <td className="p-4 text-muted-foreground">{c.status}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => editar(c)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
                    >
                      Editar
                    </button>
                    {!c.is_external && (
                      <Link
                        to="/admin/curso/$id"
                        params={{ id: c.id }}
                        className="rounded-full border border-primary px-3 py-1.5 text-xs font-bold text-primary"
                      >
                        Aulas
                      </Link>
                    )}
                    {isSuperAdmin && (
                      <button
                        onClick={() => excluir(c)}
                        className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
