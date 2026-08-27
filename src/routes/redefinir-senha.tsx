import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Campo } from "./entrar";

export const Route = createFileRoute("/redefinir-senha")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha | Conecta Oportunidades" },
      { name: "description", content: "Defina uma nova senha para a sua conta." },
      { property: "og:title", content: "Redefinir senha" },
      { property: "og:description", content: "Defina uma nova senha para a sua conta." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedefinirSenhaPage,
});

function RedefinirSenhaPage() {
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState("");
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setOk("");
    const form = new FormData(e.currentTarget);
    const senha = String(form.get("senha") ?? "");
    const confirmar = String(form.get("confirmar") ?? "");
    if (senha.length < 6) return setErro("A senha deve ter pelo menos 6 caracteres.");
    if (senha !== confirmar) return setErro("As senhas não conferem.");

    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro("Link inválido ou expirado. Solicite a recuperação novamente.");
      return;
    }
    setOk("Senha alterada com sucesso!");
    setTimeout(() => navigate({ to: "/painel", replace: true }), 800);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <h1 className="text-3xl uppercase">Nova senha</h1>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <Campo label="Nova senha" type="password" name="senha" placeholder="••••••••" />
        <Campo label="Confirmar senha" type="password" name="confirmar" placeholder="••••••••" />
        <button className="w-full rounded-full bg-primary py-3 text-sm font-bold uppercase text-primary-foreground shadow-soft">
          Salvar nova senha
        </button>
        {erro && <p className="text-center text-xs text-destructive">{erro}</p>}
        {ok && <p className="text-center text-xs text-primary">{ok}</p>}
      </form>
    </div>
  );
}
