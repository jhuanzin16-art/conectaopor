import { createFileRoute, Link } from "@tanstack/react-router";
import {
  FileText,
  GraduationCap,
  Award,
  Briefcase,
  BookOpen,
  ClipboardCheck,
  Search,
} from "lucide-react";
import heroImg from "@/assets/hero-estudante.jpg";
import { cursos, oportunidades } from "@/lib/site-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conecta Oportunidades — cursos gratuitos, currículo e vagas" },
      {
        name: "description",
        content:
          "Encontre cursos gratuitos e com certificado, aprenda a fazer seu currículo e descubra vagas de emprego, estágio e concursos.",
      },
      { property: "og:title", content: "Conecta Oportunidades" },
      {
        property: "og:description",
        content:
          "Cursos, currículo e oportunidades de emprego, estágio e concursos em um só lugar.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const atalhos = [
  { to: "/cursos", label: "Cursos", icon: GraduationCap, tile: "bg-tile-1" },
  { to: "/concursos", label: "Concursos", icon: ClipboardCheck, tile: "bg-tile-3" },
  { to: "/vagas", label: "Vagas de emprego", icon: Briefcase, tile: "bg-tile-4" },
  { to: "/estagio", label: "Estágio", icon: BookOpen, tile: "bg-tile-5" },
  { to: "/curriculo", label: "Aprenda a fazer seu currículo", icon: FileText, tile: "bg-tile-2" },
] as const;

const tiles = [
  {
    to: "/curriculo",
    icon: FileText,
    title: "Aprenda a fazer seu currículo",
    text: "Monte um currículo profissional mesmo sem experiência.",
    tile: "bg-tile-1",
  },
  {
    to: "/cursos",
    icon: GraduationCap,
    title: "Encontre cursos gratuitos",
    text: "Cursos abertos de instituições reconhecidas.",
    tile: "bg-tile-5",
  },
  {
    to: "/cursos",
    icon: Award,
    title: "Cursos com certificado",
    text: "Comprove suas horas e enriqueça o currículo.",
    tile: "bg-tile-3",
  },
  {
    to: "/vagas",
    icon: Briefcase,
    title: "Procure vagas de emprego",
    text: "Oportunidades para quem está começando agora.",
    tile: "bg-tile-4",
  },
  {
    to: "/estagio",
    icon: BookOpen,
    title: "Estágios e aprendizagem",
    text: "Programas para estudantes de todas as áreas.",
    tile: "bg-tile-2",
  },
  {
    to: "/concursos",
    icon: ClipboardCheck,
    title: "Concursos abertos",
    text: "Editais com vagas de nível médio e superior.",
    tile: "bg-tile-6",
  },
] as const;

function Index() {
  return (
    <>
      <section className="bg-secondary/70">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div>
            <h1 className="text-5xl uppercase leading-[0.9] sm:text-6xl lg:text-7xl">
              Encontre sua
              <span className="mt-2 block text-primary">oportunidade</span>
            </h1>
            <div className="mt-6 h-1 w-24 rounded-full bg-primary" />
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Tudo o que você precisa para estudar, trabalhar e crescer. Em um só lugar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/curriculo"
                className="rounded-full bg-primary px-7 py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft transition-transform hover:-translate-y-0.5"
              >
                Criar meu currículo
              </Link>
              <Link
                to="/cursos"
                className="rounded-full border-2 border-primary px-7 py-3 text-sm font-bold uppercase text-primary transition-colors hover:bg-primary-soft"
              >
                Encontrar cursos
              </Link>
            </div>

            <div className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-background p-2 pl-4 shadow-soft">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                type="search"
                aria-label="Pesquisar no site"
                placeholder="Pesquisar cursos, vagas ou conteúdos..."
                className="w-full bg-transparent text-sm outline-none"
              />
              <button className="rounded-full bg-primary px-4 py-2 text-xs font-bold uppercase text-primary-foreground">
                Buscar
              </button>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImg}
              alt="Estudante sorrindo enquanto usa um notebook"
              width={1024}
              height={1024}
              className="w-full rounded-3xl object-cover shadow-soft"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap gap-3">
          {atalhos.map((a) => (
            <Link
              key={a.label}
              to={a.to}
              className="flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
            >
              <a.icon className="size-4 text-primary" />
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
        <h2 className="text-2xl uppercase">O que você encontra aqui</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.title}
              to={t.to}
              className={`group rounded-3xl ${t.tile} p-7 transition-transform hover:-translate-y-1`}
            >
              <t.icon className="size-9 text-foreground" strokeWidth={1.5} />
              <h3 className="mt-6 text-base uppercase leading-tight">{t.title}</h3>
              <p className="mt-2 text-sm text-foreground/70">{t.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl uppercase">Cursos em destaque</h2>
          <Link to="/cursos" className="text-sm font-bold text-primary">
            Ver todos →
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.slice(0, 3).map((c) => (
            <article key={c.id} className="rounded-3xl border border-border bg-card p-6">
              <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase text-primary">
                {c.categoria}
              </span>
              <h3 className="mt-4 text-lg leading-tight">{c.nome}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {c.instituicao} • {c.duracao}
              </p>
              <Link
                to="/cursos"
                className="mt-6 block rounded-full bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground"
              >
                Ver curso
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary-soft/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl uppercase">Oportunidades recentes</h2>
            <Link to="/vagas" className="text-sm font-bold text-primary">
              Ver todas →
            </Link>
          </div>
          <div className="mt-6 space-y-3">
            {oportunidades.slice(0, 3).map((o) => (
              <article
                key={o.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-base">{o.titulo}</h3>
                  <p className="text-sm text-muted-foreground">
                    {o.empresa} • {o.local} • {o.tipo}
                  </p>
                </div>
                <Link
                  to="/vagas"
                  className="rounded-full bg-primary px-5 py-2 text-center text-sm font-bold text-primary-foreground"
                >
                  Ver oportunidade
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
