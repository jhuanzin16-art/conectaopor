import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, ShieldCheck, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/certificado/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `Certificado ${params.codigo} | Conecta Oportunidades` },
      {
        name: "description",
        content: `Verificação pública do certificado ${params.codigo} emitido pelo ConectAção, com nome do aluno, curso e carga horária.`,
      },
      { property: "og:title", content: "Verificação de certificado ConectAção" },
      {
        property: "og:description",
        content: "Confira a validade e os dados de um certificado emitido pelo ConectAção.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CertificadoPage,
});

function CertificadoPage() {
  const { codigo } = useParams({ from: "/certificado/$codigo" });

  const { data, isLoading } = useQuery({
    queryKey: ["verificar-certificado", codigo],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("verify_certificate", { _code: codigo });
      if (error) throw error;
      return (data ?? [])[0] ?? null;
    },
  });

  if (isLoading) {
    return <p className="mx-auto max-w-3xl px-4 py-20 text-muted-foreground">Verificando...</p>;
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <ShieldX className="mx-auto size-10 text-destructive" />
        <h1 className="mt-4 text-2xl">Certificado não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          O código <strong>{codigo}</strong> não corresponde a nenhum certificado emitido pelo
          ConectAção.
        </p>
        <Link to="/" className="mt-6 inline-block font-bold text-primary">
          Voltar para a página inicial
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-center gap-2 text-sm font-bold uppercase text-primary print:hidden">
        <ShieldCheck className="size-4" /> Certificado válido
      </div>

      <article className="mt-6 rounded-3xl border-4 border-primary bg-card p-8 text-center sm:p-14 print:border-2">
        <Award className="mx-auto size-10 text-primary" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          ConectAção
        </p>
        <h1 className="mt-6 text-3xl">Certificado de conclusão</h1>
        <p className="mt-8 text-sm uppercase text-muted-foreground">Certificamos que</p>
        <p className="mt-2 text-2xl font-bold">{data.student_name}</p>
        <p className="mt-6 text-sm text-muted-foreground">concluiu com êxito o curso</p>
        <p className="mt-2 text-xl font-bold">{data.course_name}</p>
        <p className="mt-6 text-sm text-muted-foreground">
          Carga horária de {data.hours} horas • concluído em{" "}
          {new Date(data.issued_at).toLocaleDateString("pt-BR")}
        </p>
        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-primary">
          Código de verificação: {data.code}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Verifique em /certificado/{data.code}
        </p>
      </article>

      <div className="mt-6 flex justify-center print:hidden">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground"
        >
          Baixar PDF / imprimir
        </button>
      </div>
    </div>
  );
}
