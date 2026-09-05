import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { enviarArquivo, type Etiqueta } from "@/lib/conteudo";

export const campoClasse =
  "mt-1 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm";

export function Campo({
  label,
  valor,
  aoMudar,
  tipo = "text",
  obrigatorio,
  className = "",
  placeholder,
}: {
  label: string;
  valor: string | number;
  aoMudar: (v: string) => void;
  tipo?: string;
  obrigatorio?: boolean;
  className?: string;
  placeholder?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <input
        type={tipo}
        required={obrigatorio}
        placeholder={placeholder}
        value={valor ?? ""}
        onChange={(e) => aoMudar(e.target.value)}
        className={campoClasse}
      />
    </label>
  );
}

export function Area({
  label,
  valor,
  aoMudar,
  linhas = 3,
  className = "",
  dica,
}: {
  label: string;
  valor: string;
  aoMudar: (v: string) => void;
  linhas?: number;
  className?: string;
  dica?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      {dica && <span className="ml-2 text-xs text-muted-foreground">{dica}</span>}
      <textarea
        rows={linhas}
        value={valor ?? ""}
        onChange={(e) => aoMudar(e.target.value)}
        className={campoClasse}
      />
    </label>
  );
}

export function Selecao({
  label,
  valor,
  aoMudar,
  opcoes,
  className = "",
}: {
  label: string;
  valor: string;
  aoMudar: (v: string) => void;
  opcoes: { valor: string; rotulo: string }[];
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <select value={valor ?? ""} onChange={(e) => aoMudar(e.target.value)} className={campoClasse}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Marcador({
  label,
  valor,
  aoMudar,
  className = "",
}: {
  label: string;
  valor: boolean;
  aoMudar: (v: boolean) => void;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-2 text-sm ${className}`}>
      <input type="checkbox" checked={valor} onChange={(e) => aoMudar(e.target.checked)} />
      {label}
    </label>
  );
}

export function UploadArquivo({
  label,
  valor,
  aoMudar,
  pasta = "geral",
  accept,
  className = "",
}: {
  label: string;
  valor: string;
  aoMudar: (url: string) => void;
  pasta?: string;
  accept?: string;
  className?: string;
}) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  async function selecionar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEnviando(true);
    setErro("");
    try {
      aoMudar(await enviarArquivo(file, pasta));
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Falha no envio do arquivo.");
    } finally {
      setEnviando(false);
      e.target.value = "";
    }
  }

  return (
    <div className={`text-sm ${className}`}>
      <span>{label}</span>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <input
          value={valor ?? ""}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="Cole um link ou envie um arquivo"
          className="min-w-[200px] flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2.5 text-xs font-bold">
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          Enviar
          <input type="file" accept={accept} onChange={selecionar} className="hidden" />
        </label>
      </div>
      {valor && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(valor) && (
        <img
          src={valor}
          alt="Prévia do arquivo enviado"
          className="mt-2 h-24 rounded-xl border border-border object-cover"
        />
      )}
      {erro && <p className="mt-1 text-xs text-destructive">{erro}</p>}
    </div>
  );
}

export function SeletorEtiquetas({
  etiquetas,
  selecionadas,
  aoMudar,
  className = "",
}: {
  etiquetas: Etiqueta[];
  selecionadas: string[];
  aoMudar: (v: string[]) => void;
  className?: string;
}) {
  function alternar(slug: string) {
    aoMudar(
      selecionadas.includes(slug)
        ? selecionadas.filter((s) => s !== slug)
        : [...selecionadas, slug],
    );
  }

  return (
    <div className={`text-sm ${className}`}>
      <span>Etiquetas</span>
      <div className="mt-2 flex flex-wrap gap-2">
        {etiquetas.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Nenhuma etiqueta cadastrada ainda. Crie em Categorias e etiquetas.
          </p>
        )}
        {etiquetas.map((t) => {
          const ativa = selecionadas.includes(t.slug);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => alternar(t.slug)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                ativa
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EtiquetaStatus({ status }: { status: string }) {
  const cor =
    status === "publicado"
      ? "bg-primary/10 text-primary"
      : status === "arquivado"
        ? "bg-muted text-muted-foreground"
        : "bg-secondary text-secondary-foreground";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${cor}`}>{status}</span>
  );
}
