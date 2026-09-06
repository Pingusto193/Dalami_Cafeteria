"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Botão de voltar para a tela inicial do painel.
 *
 * A marca no canto já leva para lá, mas ninguém adivinha isso: logo clicável
 * é convenção de quem mexe com site, não de quem só quer trocar um preço.
 * Um botão escrito "Início" não depende de adivinhação.
 *
 * Some na própria tela inicial, onde não teria para onde levar.
 */
export function BotaoInicio() {
  const caminho = usePathname();
  if (caminho === "/admin") return null;

  return (
    <Link
      href="/admin"
      className="btn inline-flex items-center gap-1.5 rounded-full border border-cacau/20 px-4 py-2 text-xs font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
    >
      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Início
    </Link>
  );
}
