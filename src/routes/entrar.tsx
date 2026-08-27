import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/entrar")({
  ssr: false,
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
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) navigate({ to: "/painel", replace: true });
  }, [session, navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setAviso("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const senha = String(form.get("senha") ?? "");
    if (!email || senha.length < 6) {
      setErro("Informe um e-mail válido e uma senha de pelo menos 6 caracteres.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      setErro(
        error.message.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente novamente.",
      );
      return;
    }
    navigate({ to: "/painel", replace: true });
  }

  async function recuperarSenha() {
    setErro("");
    const email = window.prompt("Digite o e-mail da sua conta:");
    if (!email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    if (error) setErro("Não foi possível enviar o e-mail de recuperação.");
    else setAviso("Enviamos um link de recuperação para o seu e-mail.");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl uppercase">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Acesse sua área pessoal e continue de onde parou.
      </p>

      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Campo label="E-mail" type="email" name="email" placeholder="voce@email.com" />
        <Campo label="Senha" type="password" name="senha" placeholder="••••••••" />
        <button
          disabled={carregando}
          className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft disabled:opacity-60"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
        {erro && <p className="text-center text-xs text-destructive">{erro}</p>}
        {aviso && <p className="text-center text-xs text-primary">{aviso}</p>}
      </form>

      <button
        type="button"
        onClick={recuperarSenha}
        className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Esqueci minha senha
      </button>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-bold text-primary">
          Criar uma conta
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
