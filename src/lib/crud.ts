import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Tabela =
  | "content_categories"
  | "content_tags"
  | "certificate_templates"
  | "resume_templates"
  | "job_openings"
  | "public_exams"
  | "internships"
  | "media_assets"
  | "course_modules"
  | "lesson_blocks"
  | "quizzes"
  | "quiz_questions"
  | "lessons"
  | "courses";

// Camadas simples de leitura/escrita usadas pelas telas do painel.
export function useLista<T>(tabela: Tabela, ordem: string[] = ["created_at"], filtro?: Record<string, string>) {
  return useQuery({
    queryKey: [tabela, ordem.join(","), JSON.stringify(filtro ?? {})],
    queryFn: async () => {
      let q = supabase.from(tabela).select("*");
      for (const [k, v] of Object.entries(filtro ?? {})) q = q.eq(k, v);
      for (const col of ordem) q = q.order(col, { ascending: true });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export function useAcoes(tabela: Tabela) {
  const qc = useQueryClient();
  const atualizarCache = () => qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === tabela });

  return {
    async criar(valores: Record<string, unknown>) {
      const { error } = await supabase.from(tabela).insert(valores as never);
      if (error) throw error;
      atualizarCache();
    },
    async atualizar(id: string, valores: Record<string, unknown>) {
      const { error } = await supabase
        .from(tabela)
        .update(valores as never)
        .eq("id", id);
      if (error) throw error;
      atualizarCache();
    },
    async remover(id: string) {
      const { error } = await supabase.from(tabela).delete().eq("id", id);
      if (error) throw error;
      atualizarCache();
    },
    async duplicar(registro: Record<string, unknown>, ajustes: Record<string, unknown> = {}) {
      const copia = { ...registro, ...ajustes };
      delete copia.id;
      delete copia.created_at;
      delete copia.updated_at;
      const { error } = await supabase.from(tabela).insert(copia as never);
      if (error) throw error;
      atualizarCache();
    },
    atualizarCache,
  };
}
