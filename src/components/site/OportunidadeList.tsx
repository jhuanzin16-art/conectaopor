import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { oportunidades, type Oportunidade } from "@/lib/site-data";

export function OportunidadeList({ tipos }: { tipos: Oportunidade["tipo"][] }) {
  const [busca, setBusca] = useState("");

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return oportunidades
      .filter((o) => tipos.includes(o.tipo))
      .filter(
        (o) =>
          !termo ||
          o.titulo.toLowerCase().includes(termo) ||
          o.empresa.toLowerCase().includes(termo) ||
          o.local.toLowerCase().includes(termo),
      );
  }, [busca, tipos]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex max-w-xl items-center gap-2 rounded-full border border-border bg-card px-4 py-3">
        <Search className="size-4 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar oportunidades..."
          aria-label="Pesquisar oportunidades"
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mt-8 space-y-4">
        {lista.map((o) => (
          <article
            key={o.id}
            className="rounded-3xl border border-border bg-card p-6 transition-shadow hover:shadow-soft"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="rounded-full bg-primary-soft px-3 py-1 text-[11px] font-bold uppercase text-primary">
                  {o.tipo}
                </span>
                <h2 className="mt-3 text-lg leading-tight">{o.titulo}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.empresa} • {o.local}
                </p>
                <p className="mt-2 text-sm text-foreground/80">Requisitos: {o.requisitos}</p>
                <p className="mt-1 text-sm text-muted-foreground">Prazo: {o.prazo}</p>
              </div>
              <button className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-soft">
                Ver oportunidade
              </button>
            </div>
          </article>
        ))}
        {lista.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma oportunidade encontrada.</p>
        )}
      </div>
    </div>
  );
}
