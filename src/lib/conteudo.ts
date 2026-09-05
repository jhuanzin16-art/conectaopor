import { supabase } from "@/integrations/supabase/client";

export type Status = "rascunho" | "publicado" | "desativado" | "arquivado";

export const STATUS: { valor: Status; rotulo: string }[] = [
  { valor: "rascunho", rotulo: "Rascunho" },
  { valor: "publicado", rotulo: "Publicado" },
  { valor: "desativado", rotulo: "Desativado" },
  { valor: "arquivado", rotulo: "Arquivado" },
];

export const rotuloStatus: Record<Status, string> = {
  rascunho: "Rascunho",
  publicado: "Publicado",
  desativado: "Desativado",
  arquivado: "Arquivado",
};

export type Escopo = "curso" | "vaga" | "concurso" | "estagio" | "curriculo" | "conteudo";

export const ESCOPOS: { valor: Escopo; rotulo: string }[] = [
  { valor: "curso", rotulo: "Cursos" },
  { valor: "vaga", rotulo: "Vagas" },
  { valor: "concurso", rotulo: "Concursos" },
  { valor: "estagio", rotulo: "Estágios" },
  { valor: "curriculo", rotulo: "Modelos de currículo" },
  { valor: "conteudo", rotulo: "Conteúdos" },
];

export type Categoria = {
  id: string;
  scope: Escopo;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string;
  active: boolean;
  position: number;
};

export type Etiqueta = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  position: number;
};

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEZ_ANOS = 60 * 60 * 24 * 365 * 10;

/** Envia um arquivo para a biblioteca de mídia e devolve a URL utilizável no site. */
export async function enviarArquivo(file: File, pasta = "geral") {
  const caminho = `${pasta}/${Date.now()}-${slugify(file.name)}`;
  const { error } = await supabase.storage.from("midia").upload(caminho, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;

  const { data, error: erroUrl } = await supabase.storage
    .from("midia")
    .createSignedUrl(caminho, DEZ_ANOS);
  if (erroUrl || !data?.signedUrl) throw erroUrl ?? new Error("Não foi possível gerar o link.");

  const { data: sessao } = await supabase.auth.getUser();
  await supabase.from("media_assets").insert({
    name: file.name,
    url: data.signedUrl,
    path: caminho,
    mime_type: file.type,
    size_bytes: file.size,
    created_by: sessao.user?.id ?? null,
  });

  return data.signedUrl;
}

export async function listarCategorias(scope?: Escopo) {
  let q = supabase
    .from("content_categories")
    .select("id, scope, parent_id, name, slug, description, active, position")
    .order("position")
    .order("name");
  if (scope) q = q.eq("scope", scope);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Categoria[];
}

export async function listarEtiquetas() {
  const { data, error } = await supabase
    .from("content_tags")
    .select("id, name, slug, active, position")
    .order("position")
    .order("name");
  if (error) throw error;
  return (data ?? []) as Etiqueta[];
}

export function textoParaLista(texto: string) {
  return texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function listaParaTexto(lista: string[] | null | undefined) {
  return (lista ?? []).join("\n");
}
