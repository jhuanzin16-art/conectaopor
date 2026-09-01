import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BookmarkCheck, PlayCircle, CheckCircle2, User, LogOut, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Minha área | Conecta Oportunidades" },
      {
        name: "description",
        content: "Acompanhe seus cursos salvos, iniciados e concluídos e edite seu perfil.",
      },
      { property: "og:title", content: "Minha área" },
      { property: "og:description", content: "Painel pessoal da Conecta Oportunidades." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelPage,
});

type Curso = {
  id: string;
  course_id: string;
  course_name: string;
  instituicao: string | null;
  status: "salvo" | "iniciado" | "concluido";
};

function PainelPage() {
  const { user, nome, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: perfil } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: cursos = [] } = useQuery({
    queryKey: ["user_courses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_courses")
        .select("id, course_id, course_name, instituicao, status")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Curso[];
    },
  });

  const [nomeEdit, setNomeEdit] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (perfil?.full_name) setNomeEdit(perfil.full_name);
  }, [perfil?.full_name]);

  const displayName = perfil?.full_name?.trim() || nome;

  async function atualizarStatus(id: string, status: Curso["status"]) {
    await supabase.from("user_courses").update({ status }).eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["user_courses"] });
  }

  async function remover(id: string) {
    await supabase.from("user_courses").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["user_courses"] });
  }

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: nomeEdit.trim() })
      .eq("id", user!.id);
    if (error) {
      setMsg("Não foi possível salvar. Tente novamente.");
      return;
    }
    await supabase.auth.updateUser({ data: { full_name: nomeEdit.trim() } });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setMsg("Perfil atualizado!");
  }

  async function sair() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/entrar", replace: true });
  }

  const grupos = [
    { key: "salvo" as const, label: "Cursos salvos", icon: BookmarkCheck },
    { key: "iniciado" as const, label: "Cursos iniciados", icon: PlayCircle },
    { key: "concluido" as const, label: "Cursos concluídos", icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl uppercase">Olá, {displayName}! 👋</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="size-4" /> {perfil?.email ?? user?.email}
          </p>
        </div>
        <button
          onClick={sair}
          className="flex items-center gap-2 rounded-full border border-primary px-5 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          <LogOut className="size-4" /> Sair
        </button>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/cursos"
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:border-primary hover:text-primary"
        >
          Cursos
        </Link>
        <Link
          to="/meus-cursos"
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:border-primary hover:text-primary"
        >
          Meus cursos e progresso
        </Link>
        <Link
          to="/certificados"
          className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold uppercase text-muted-foreground hover:border-primary hover:text-primary"
        >
          Meus certificados
        </Link>
      </nav>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">

        {grupos.map((g) => (
          <div key={g.key} className="rounded-3xl border border-border bg-card p-6">
            <g.icon className="size-5 text-primary" />
            <p className="mt-3 text-3xl font-bold">
              {cursos.filter((c) => c.status === g.key).length}
            </p>
            <p className="text-sm text-muted-foreground">{g.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-8">
        {grupos.map((g) => {
          const lista = cursos.filter((c) => c.status === g.key);
          return (
            <section key={g.key}>
              <h2 className="text-lg uppercase">{g.label}</h2>
              {lista.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Nenhum curso aqui ainda. Salve cursos na página de cursos.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {lista.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                    >
                      <div>
                        <p className="font-semibold">{c.course_name}</p>
                        <p className="text-xs text-muted-foreground">{c.instituicao}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {grupos
                          .filter((o) => o.key !== c.status)
                          .map((o) => (
                            <button
                              key={o.key}
                              onClick={() => atualizarStatus(c.id, o.key)}
                              className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary"
                            >
                              Marcar como {o.key}
                            </button>
                          ))}
                        <button
                          onClick={() => remover(c.id)}
                          className="rounded-full px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary"
                        >
                          Remover
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <section className="mt-12 rounded-3xl border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 text-lg uppercase">
          <User className="size-5 text-primary" /> Perfil
        </h2>
        <form onSubmit={salvarPerfil} className="mt-4 max-w-md space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Nome completo
            </span>
            <input
              value={nomeEdit}
              onChange={(e) => setNomeEdit(e.target.value)}
              required
              maxLength={100}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground">
            Salvar perfil
          </button>
          {msg && <p className="text-xs text-primary">{msg}</p>}
        </form>
      </section>
    </div>
  );
}
