import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campo } from "./entrar";

export const Route = createFileRoute("/cadastro")({
  ssr: false,
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
  const [sucesso, setSucesso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setSucesso("");
    const form = new FormData(e.currentTarget);
    const nome = String(form.get("nome") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const senha = String(form.get("senha") ?? "");
    const confirmar = String(form.get("confirmar") ?? "");

    if (nome.length < 3) return setErro("Informe seu nome completo.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErro("Informe um e-mail válido.");
    if (senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não conferem.");

    setCarregando(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        emailRedirectTo: `${window.location.origin}/painel`,
        data: { full_name: nome },
      },
    });
    setCarregando(false);

    if (error) {
      const m = error.message.toLowerCase();
      setErro(
        m.includes("already") || m.includes("registered")
          ? "Este e-mail já está cadastrado. Faça login."
          : m.includes("pwned") || m.includes("weak") || m.includes("password")
            ? "Essa senha é muito fraca ou já apareceu em vazamentos. Escolha outra senha."
            : m.includes("email")
              ? "E-mail inválido. Use um endereço de e-mail válido."
              : "Não foi possível criar a conta. Tente novamente.",
      );
      return;
    }

    if (data.session) {
      setSucesso("Conta criada com sucesso! Redirecionando...");
      navigate({ to: "/painel", replace: true });
      return;
    }

    setSucesso("Conta criada! Confirme seu e-mail para acessar sua área pessoal.");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl uppercase">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        É gratuito e leva menos de um minuto.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Campo label="Nome completo" name="nome" placeholder="Seu nome" maxLength={100} />
        <Campo label="E-mail" type="email" name="email" placeholder="voce@email.com" />
        <Campo label="Senha" type="password" name="senha" placeholder="••••••••" />
        <Campo label="Confirmar senha" type="password" name="confirmar" placeholder="••••••••" />
        <button
          disabled={carregando}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft disabled:opacity-60"
        >
          {carregando ? "Criando..." : "Criar conta"}
        </button>
        {erro && <p className="text-center text-xs text-destructive">{erro}</p>}
        {sucesso && <p className="text-center text-xs text-primary">{sucesso}</p>}
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
