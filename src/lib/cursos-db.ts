import { supabase } from "@/integrations/supabase/client";

export type Nivel = "iniciante" | "intermediario" | "avancado";

export const rotuloNivel: Record<Nivel, string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export type CursoDB = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_url: string | null;
  category_id: string | null;
  level: Nivel;
  hours: number;
  instructor: string;
  status: "rascunho" | "publicado";
  is_external: boolean;
  platform: string | null;
  external_url: string | null;
  views_count: number;
  created_at: string;
};

export const CURSO_FIELDS =
  "id, title, slug, description, cover_url, category_id, level, hours, instructor, status, is_external, platform, external_url, views_count, created_at";

export async function listarCursosPublicados() {
  const { data, error } = await supabase
    .from("courses")
    .select(CURSO_FIELDS)
    .eq("status", "publicado")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as CursoDB[];
}

export async function listarCategorias() {
  const { data, error } = await supabase
    .from("course_categories")
    .select("id, name, slug")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
