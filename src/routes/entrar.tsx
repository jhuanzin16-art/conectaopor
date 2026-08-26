import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar na sua conta | Conecta Oportunidades" },
      {
        name: "description",
        content: "Acesse sua área pessoal para ver cursos salvos, oportunidades e seu currículo.",
      },
      { property: "og:title", content: "Entrar" },
      { property: "og:description", content: "Acesse sua conta na Conecta Oportunidades." },
      { property: "og:url", content: "/entrar" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/entrar" }],
  }),
  component: EntrarPage,
});

function EntrarPage() {
  const [aviso, setAviso] = useState("");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl uppercase">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acesse sua área pessoal e continue de onde parou.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setAviso("Login será ativado quando o banco de dados for conectado.");
        }}
      >
        <Campo label="E-mail" type="email" name="email" placeholder="voce@email.com" />
        <Campo label="Senha" type="password" name="senha" placeholder="••••••••" />
        <button className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft">
          Entrar
        </button>
        {aviso && <p className="text-center text-xs text-primary">{aviso}</p>}
      </form>

      <button
        onClick={() => setAviso("Enviaremos um link de recuperação para o seu e-mail.")}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Esqueci minha senha
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-bold text-primary">
          Criar conta
        </Link>
      </p>
    </div>
  );
}

export function Campo({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        required
        {...props}
        className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
