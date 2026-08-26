import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-display text-lg leading-none">
            <span className="block">CONECTA</span>
            <span className="block text-primary">OPORTUNIDADES</span>
          </p>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Projeto acadêmico que reúne cursos, currículo e oportunidades para quem está
            começando na vida profissional.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
            Aprender
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/cursos" className="hover:text-primary">
                Cursos gratuitos
              </Link>
            </li>
            <li>
              <Link to="/curriculo" className="hover:text-primary">
                Aprenda a fazer seu currículo
              </Link>
            </li>
            <li>
              <Link to="/conteudos" className="hover:text-primary">
                Dicas e conteúdos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
            Oportunidades
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/vagas" className="hover:text-primary">
                Vagas de emprego
              </Link>
            </li>
            <li>
              <Link to="/estagio" className="hover:text-primary">
                Estágio
              </Link>
            </li>
            <li>
              <Link to="/concursos" className="hover:text-primary">
                Concursos
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-primary">
            Conta
          </h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>
              <Link to="/entrar" className="hover:text-primary">
                Entrar
              </Link>
            </li>
            <li>
              <Link to="/cadastro" className="hover:text-primary">
                Criar conta
              </Link>
            </li>
            <li>
              <Link to="/sobre" className="hover:text-primary">
                Sobre o projeto
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Conecta Oportunidades — Projeto acadêmico.
      </div>
    </footer>
  );
}
