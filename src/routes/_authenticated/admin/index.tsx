import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard administrativo | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Estatísticas de usuários, cursos, matrículas e certificados da plataforma ConectAção.",
      },
      { property: "og:title", content: "Dashboard administrativo" },
      { property: "og:description", content: "Visão geral da plataforma ConectAção." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

type Stats = {
  total_users: number;
  active_users: number;
  banned_users: number;
  total_courses: number;
  own_courses: number;
  external_courses: number;
  started_courses: number;
  completed_courses: number;
  certificates: number;
};

function Card({ label, valor }: { label: string; valor: number | string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-primary">{valor}</p>
    </div>
  );
}

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_stats");
      if (error) throw error;
      return data as unknown as Stats;
    },
  });

  const { data: populares = [] } = useQuery({
    queryKey: ["admin-populares"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, views_count")
        .order("views_count", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: novos = [] } = useQuery({
    queryKey: ["admin-novos-usuarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: concluidos = [] } = useQuery({
    queryKey: ["admin-concluidos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("course_id, courses(title)")
        .not("completed_at", "is", null);
      if (error) throw error;
      const contagem = new Map<string, { title: string; total: number }>();
      for (const linha of (data ?? []) as unknown as {
        course_id: string;
        courses: { title: string } | null;
      }[]) {
        const atual = contagem.get(linha.course_id) ?? {
          title: linha.courses?.title ?? "Curso",
          total: 0,
        };
        atual.total += 1;
        contagem.set(linha.course_id, atual);
      }
      return [...contagem.values()].sort((a, b) => b.total - a.total).slice(0, 5);
    },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Visão geral</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Usuários registrados" valor={stats?.total_users ?? "—"} />
        <Card label="Usuários ativos" valor={stats?.active_users ?? "—"} />
        <Card label="Usuários banidos" valor={stats?.banned_users ?? "—"} />
        <Card label="Cursos disponíveis" valor={stats?.total_courses ?? "—"} />
        <Card label="Cursos próprios" valor={stats?.own_courses ?? "—"} />
        <Card label="Cursos externos" valor={stats?.external_courses ?? "—"} />
        <Card label="Cursos iniciados" valor={stats?.started_courses ?? "—"} />
        <Card label="Cursos concluídos" valor={stats?.completed_courses ?? "—"} />
        <Card label="Certificados emitidos" valor={stats?.certificates ?? "—"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg">Cursos mais acessados</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {populares.map((c) => (
              <li key={c.id} className="flex justify-between gap-3">
                <span className="truncate">{c.title}</span>
                <span className="font-bold text-primary">{c.views_count}</span>
              </li>
            ))}
            {populares.length === 0 && <li className="text-muted-foreground">Sem dados ainda.</li>}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg">Cursos mais concluídos</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {concluidos.map((c) => (
              <li key={c.title} className="flex justify-between gap-3">
                <span className="truncate">{c.title}</span>
                <span className="font-bold text-primary">{c.total}</span>
              </li>
            ))}
            {concluidos.length === 0 && <li className="text-muted-foreground">Sem dados ainda.</li>}
          </ul>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="text-lg">Novos usuários</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {novos.map((u) => (
              <li key={u.id}>
                <p className="font-bold">{u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString("pt-BR")}
                </p>
              </li>
            ))}
            {novos.length === 0 && <li className="text-muted-foreground">Sem dados ainda.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
