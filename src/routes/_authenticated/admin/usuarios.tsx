import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Gerenciar usuários | Conecta Oportunidades" },
      {
        name: "description",
        content: "Liste, pesquise, banir e desbanir usuários da plataforma ConectAção.",
      },
      { property: "og:title", content: "Gerenciar usuários" },
      { property: "og:description", content: "Administração de contas do ConectAção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminUsuarios,
});

type Perfil = {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
  banned: boolean;
  ban_reason: string | null;
};

function AdminUsuarios() {
  const { canManageUsers } = useRoles();
  const qc = useQueryClient();
  const [busca, setBusca] = useState("");
  const [detalhe, setDetalhe] = useState<Perfil | null>(null);
  const [erro, setErro] = useState("");

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ["admin-usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, banned, ban_reason")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Perfil[];
    },
  });

  const { data: detalheDados } = useQuery({
    queryKey: ["admin-usuario-detalhe", detalhe?.id],
    enabled: !!detalhe,
    queryFn: async () => {
      const [matriculas, certificados] = await Promise.all([
        supabase
          .from("enrollments")
          .select("progress, completed_at, courses(title)")
          .eq("user_id", detalhe!.id),
        supabase.from("certificates").select("code, course_name").eq("user_id", detalhe!.id),
      ]);
      return {
        matriculas: (matriculas.data ?? []) as unknown as {
          progress: number;
          completed_at: string | null;
          courses: { title: string } | null;
        }[],
        certificados: certificados.data ?? [],
      };
    },
  });

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuarios;
    return usuarios.filter(
      (u) =>
        u.full_name.toLowerCase().includes(termo) || (u.email ?? "").toLowerCase().includes(termo),
    );
  }, [usuarios, busca]);

  async function alternarBanimento(u: Perfil) {
    const banir = !u.banned;
    const motivo = banir
      ? window.prompt(`Confirmar banimento de ${u.full_name || u.email}?\nMotivo (opcional):`, "")
      : window.confirm(`Desbanir ${u.full_name || u.email}?`)
        ? ""
        : null;
    if (motivo === null) return;

    setErro("");
    const { error } = await supabase
      .from("profiles")
      .update({
        banned: banir,
        banned_at: banir ? new Date().toISOString() : null,
        ban_reason: banir ? motivo || null : null,
      })
      .eq("id", u.id);
    if (error) setErro(error.message);
    else qc.invalidateQueries({ queryKey: ["admin-usuarios"] });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Usuários</h1>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Pesquisar por nome ou e-mail..."
        aria-label="Pesquisar usuários"
        className="w-full max-w-md rounded-full border border-border bg-card px-4 py-2.5 text-sm outline-none"
      />

      {erro && <p className="text-sm text-destructive">{erro}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Cadastro</th>
              <th className="p-4">Status</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((u) => (
              <tr key={u.id} className="border-t border-border">
                <td className="p-4 font-bold">{u.full_name || "—"}</td>
                <td className="p-4 text-muted-foreground">{u.email}</td>
                <td className="p-4 text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      u.banned
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary-soft text-primary"
                    }`}
                  >
                    {u.banned ? "Banido" : "Ativo"}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setDetalhe(u)}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
                    >
                      Detalhes
                    </button>
                    {canManageUsers && (
                      <button
                        onClick={() => alternarBanimento(u)}
                        className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                          u.banned
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}
                      >
                        {u.banned ? "Desbanir" : "Banir"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {detalhe && (
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg">{detalhe.full_name || detalhe.email}</h2>
              <p className="text-sm text-muted-foreground">{detalhe.email}</p>
              <p className="text-xs text-muted-foreground">
                Cadastrado em {new Date(detalhe.created_at).toLocaleDateString("pt-BR")}
              </p>
              {detalhe.banned && detalhe.ban_reason && (
                <p className="mt-2 text-sm text-destructive">Motivo do banimento: {detalhe.ban_reason}</p>
              )}
            </div>
            <button onClick={() => setDetalhe(null)} className="text-xs font-bold uppercase">
              Fechar
            </button>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground">Cursos</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {(detalheDados?.matriculas ?? []).map((m, i) => (
                  <li key={i}>
                    {m.courses?.title} — {m.progress}%{m.completed_at ? " (concluído)" : ""}
                  </li>
                ))}
                {(detalheDados?.matriculas ?? []).length === 0 && (
                  <li className="text-muted-foreground">Nenhum curso iniciado.</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-muted-foreground">Certificados</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {(detalheDados?.certificados ?? []).map((c) => (
                  <li key={c.code}>
                    {c.course_name} — {c.code}
                  </li>
                ))}
                {(detalheDados?.certificados ?? []).length === 0 && (
                  <li className="text-muted-foreground">Nenhum certificado.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
