import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/", label: "Início" },
  { to: "/cursos", label: "Cursos" },
  { to: "/concursos", label: "Concursos" },
  { to: "/vagas", label: "Vagas de emprego" },
  { to: "/estagio", label: "Estágio" },
  { to: "/curriculo", label: "Currículo" },
  { to: "/sobre", label: "Sobre" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { session, nome, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function sair() {
    setOpen(false);
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/entrar", replace: true });
  }


  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="font-display text-lg leading-none tracking-tight">
          <span className="block text-foreground">CONECTA</span>
          <span className="block text-primary">OPORTUNIDADES</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-semibold lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <Link
                to="/painel"
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft"
              >
                <LayoutDashboard className="size-4" />
                {nome ? `Olá, ${nome.split(" ")[0]}` : "Minha área"}
              </Link>
              <button
                onClick={sair}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
              >
                <LogOut className="size-4" /> Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/entrar"
                className="rounded-full px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Cadastre-se
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex gap-2">
            {session ? (
              <>
                <Link
                  to="/painel"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground"
                >
                  Minha área
                </Link>
                <button
                  onClick={sair}
                  className="flex-1 rounded-full border border-primary px-4 py-2 text-center text-sm font-bold text-primary"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/entrar"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-primary px-4 py-2 text-center text-sm font-bold text-primary"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-primary px-4 py-2 text-center text-sm font-bold text-primary-foreground"
                >
                  Cadastre-se
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
