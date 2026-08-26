import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Campo } from "./entrar";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Criar conta gratuita | Conecta Oportunidades" },
      {
        name: "description",
        content:
          "Crie sua conta gratuita para salvar cursos, acompanhar oportunidades e montar seu currículo.",
      },
      { property: "og:title", content: "Criar conta" },
      { property: "og:description", content: "Cadastro gratuito na Conecta Oportunidades." },
      { property: "og:url", content: "/cadastro" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/cadastro" }],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const [erro, setErro] = useState("");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl uppercase">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        É gratuito e leva menos de um minuto.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          if (form.get("senha") !== form.get("confirmar")) {
            setErro("As senhas não conferem.");
            return;
          }
          setErro("Cadastro será ativado quando o banco de dados for conectado.");
        }}
      >
        <Campo label="Nome completo" name="nome" placeholder="Seu nome" />
        <Campo label="E-mail" type="email" name="email" placeholder="voce@email.com" />
        <Campo label="Senha" type="password" name="senha" placeholder="••••••••" />
        <Campo label="Confirmar senha" type="password" name="confirmar" placeholder="••••••••" />
        <button className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft">
          Criar conta
        </button>
        {erro && <p className="text-center text-xs text-primary">{erro}</p>}
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/entrar" className="font-bold text-primary">
          Entrar
        </Link>
      </p>
    </div>
  );
}
