import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/entrar" });
    return { user: data.user };
  },
  component: AreaAutenticada,
});

function AreaAutenticada() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: perfil, isLoading } = useQuery({
    queryKey: ["conta-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("banned, ban_reason")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <Outlet />;

  if (perfil?.banned) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl">Conta banida</h1>
        <p className="mt-3 text-muted-foreground">
          Sua conta foi suspensa e não pode acessar as áreas do ConectAção.
          {perfil.ban_reason ? ` Motivo: ${perfil.ban_reason}` : ""}
        </p>
        <button
          onClick={async () => {
            await qc.cancelQueries();
            qc.clear();
            await supabase.auth.signOut();
            navigate({ to: "/entrar", replace: true });
          }}
          className="mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Sair
        </button>
      </div>
    );
  }

  return <Outlet />;
}
