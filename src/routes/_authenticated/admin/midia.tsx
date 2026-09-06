import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAcoes, useLista } from "@/lib/crud";
import { UploadArquivo } from "@/components/admin/Campos";

export const Route = createFileRoute("/_authenticated/admin/midia")({
  head: () => ({
    meta: [
      { title: "Biblioteca de mídia | Conecta Oportunidades" },
      {
        name: "description",
        content: "Envie e reutilize imagens, PDFs, vídeos e modelos no conteúdo do site.",
      },
      { property: "og:title", content: "Biblioteca de mídia" },
      { property: "og:description", content: "Arquivos usados no Conecta Oportunidades." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMidia,
});

type Arquivo = {
  id: string;
  name: string;
  url: string;
  path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

function AdminMidia() {
  const { data: arquivos = [] } = useLista<Arquivo>("media_assets", ["created_at"]);
  const acoes = useAcoes("media_assets");
  const [ultimo, setUltimo] = useState("");

  const ordenados = [...arquivos].reverse();

  return (
    <div className="space-y-8">
      <h1 className="text-2xl">Biblioteca de mídia</h1>

      <div className="rounded-3xl border border-border bg-card p-6">
        <UploadArquivo
          label="Enviar novo arquivo"
          valor={ultimo}
          aoMudar={(url) => {
            setUltimo(url);
            acoes.atualizarCache();
          }}
          pasta="biblioteca"
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Depois de enviar, copie o link e use em qualquer curso, vaga, concurso ou estágio.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordenados.map((a) => (
          <li key={a.id} className="rounded-3xl border border-border bg-card p-4">
            {/\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(a.url) ? (
              <img
                src={a.url}
                alt={a.name}
                className="h-32 w-full rounded-2xl border border-border object-cover"
              />
            ) : (
              <div className="flex h-32 items-center justify-center rounded-2xl border border-border text-xs text-muted-foreground">
                {a.mime_type || "arquivo"}
              </div>
            )}
            <p className="mt-3 truncate text-sm font-bold">{a.name}</p>
            <p className="text-xs text-muted-foreground">
              {(a.size_bytes / 1024 / 1024).toFixed(2)} MB
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => navigator.clipboard?.writeText(a.url)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Copiar link
              </button>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-bold"
              >
                Abrir
              </a>
              <button
                onClick={() => {
                  if (window.confirm(`Remover "${a.name}" da biblioteca?`)) acoes.remover(a.id);
                }}
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
        {arquivos.length === 0 && (
          <li className="text-sm text-muted-foreground">Nenhum arquivo enviado ainda.</li>
        )}
      </ul>
    </div>
  );
}
