import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useRoles } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, isStaff, canManageUsers, isSuperAdmin } = useRoles();

  if (loading) {
    return <p className="mx-auto max-w-5xl px-4 py-20 text-muted-foreground">Carregando...</p>;
  }

  if (!isStaff) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl">Acesso negado</h1>
        <p className="mt-2 text-muted-foreground">
          Sua conta não possui permissão para acessar a área administrativa.
        </p>
        <Link to="/painel" className="mt-6 inline-block font-bold text-primary">
          Voltar para o meu painel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Administração</p>
      <nav className="mt-4 flex flex-wrap gap-2">
        <AdminLink to="/admin">Dashboard</AdminLink>
        {canManageUsers && <AdminLink to="/admin/usuarios">Usuários</AdminLink>}
        <AdminLink to="/admin/cursos">Cursos</AdminLink>
        {isSuperAdmin && <AdminLink to="/admin/administradores">Administradores</AdminLink>}
      </nav>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  );
}

function AdminLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      activeOptions={{ exact: to === "/admin" }}
      activeProps={{ className: "bg-primary text-primary-foreground" }}
      inactiveProps={{
        className: "border border-border bg-card text-muted-foreground hover:text-primary",
      }}
      className="rounded-full px-4 py-2 text-xs font-bold uppercase transition-colors"
    >
      {children}
    </Link>
  );
}
