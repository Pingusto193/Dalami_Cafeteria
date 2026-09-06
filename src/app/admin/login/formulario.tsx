"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { entrar, type EstadoLogin } from "./acoes";

const INICIAL: EstadoLogin = { erro: null };

function Botao() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn mt-6 w-full rounded-full bg-oliva px-6 py-3.5 font-medium text-creme-alto transition-colors hover:bg-oliva-escuro disabled:opacity-60"
    >
      {pending ? "Entrando..." : "Entrar"}
    </button>
  );
}

export function FormularioLogin({ voltar }: { voltar?: string }) {
  const [estado, acao] = useActionState(entrar, INICIAL);

  return (
    <form action={acao}>
      {voltar && <input type="hidden" name="voltar" value={voltar} />}

      <label className="block">
        <span className="font-rotulo text-[0.6rem] uppercase tracking-[0.2em] text-tinta-suave">
          Usuário
        </span>
        <input
          name="usuario"
          type="text"
          autoComplete="username"
          autoFocus
          required
          className="mt-2 w-full rounded-xl border border-tinta/15 bg-creme px-4 py-3 text-tinta outline-none transition-colors focus:border-oliva"
        />
      </label>

      <label className="mt-5 block">
        <span className="font-rotulo text-[0.6rem] uppercase tracking-[0.2em] text-tinta-suave">
          Senha
        </span>
        <input
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-xl border border-tinta/15 bg-creme px-4 py-3 text-tinta outline-none transition-colors focus:border-oliva"
        />
      </label>

      {estado.erro && (
        // aria-live: quem usa leitor de tela ouve o erro sem precisar procurar.
        <p
          role="alert"
          aria-live="polite"
          className="mt-5 rounded-xl border border-terracota/30 bg-terracota/8 px-4 py-3 text-sm text-terracota"
        >
          {estado.erro}
        </p>
      )}

      <Botao />
    </form>
  );
}
