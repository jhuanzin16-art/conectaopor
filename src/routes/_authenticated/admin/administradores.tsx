import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rotuloRole, useRoles, type AppRole } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin/administradores")({
  head: () => ({
    meta: [
      { title: "Administradores | Conecta Oportunidades" },
      {
        name: "description",
        content: "Conceda e remova permissões de Super Admin, Administrador e Editor.",
      },
      { property: "og:title", content: "Gerenciar administradores" },
      { property: "og:description", content: "Controle de permissões do ConectAção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAdministradores,
});

function AdminAdministradores() {
  const { isSuperAdmin, loading } = useRoles();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("editor");
  const [msg, setMsg] = useState("");

  const { data: equipe = [] } = useQuery({
    queryKey: ["admin-equipe"],
    enabled: isSuperAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("id, user_id, role");
      if (error) throw error;
      const ids = (data ?? []).map((r) => r.user_id);
      const perfis = ids.length
        ? ((
            await supabase.from("profiles").select("id, full_name, email").in("id", ids)
          ).data ?? [])
        : [];
      return (data ?? []).map((r) => ({
        ...r,
        perfil: perfis.find((p) => p.id === r.user_id),
      }));
    },
  });

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;
  if (!isSuperAdmin) {
    return (
      <p className="text-muted-foreground">
        Apenas o Super Admin pode gerenciar outros administradores.
      </p>
    );
  }

  async function conceder(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { data: perfil, error: erroPerfil } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();
    if (erroPerfil) return setMsg(erroPerfil.message);
    if (!perfil) return setMsg("Nenhum usuário cadastrado com esse e-mail.");

    const { error } = await supabase.from("user_roles").insert({ user_id: perfil.id, role });
    if (error) return setMsg(error.message);
    setMsg("Permissão concedida.");
    setEmail("");
    qc.invalidateQueries({ queryKey: ["admin-equipe"] });
  }

  async function remover(id: string) {
    if (!window.confirm("Remover esta permissão?")) return;
    const { error } = await supabase.from("user_roles").delete().eq("id", id);
    if (error) setMsg(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-equipe"] });
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Administradores</h1>

      <form
        onSubmit={conceder}
        className="grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-[1fr_auto_auto] sm:items-end"
      >
        <label className="text-sm">
          E-mail do usuário
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
          />
        </label>
        <label className="text-sm">
          Nível
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as AppRole)}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
          >
            <option value="editor">Editor</option>
            <option value="admin">Administrador</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </label>
        <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
          Conceder
        </button>
      </form>

      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}

      <ul className="space-y-3">
        {equipe.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border bg-card p-5"
          >
            <div>
              <p className="font-bold">{r.perfil?.full_name || r.perfil?.email || r.user_id}</p>
              <p className="text-xs uppercase text-primary">{rotuloRole[r.role as AppRole]}</p>
            </div>
            <button
              onClick={() => remover(r.id)}
              className="rounded-full bg-destructive px-4 py-2 text-xs font-bold text-destructive-foreground"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
