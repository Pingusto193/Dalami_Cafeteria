"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Ordem } from "../componentes";
import { alternarDisponivel, moverProduto } from "./acoes";

export function LinhaDoItem({
  id,
  nome,
  preco,
  precoPromo,
  disponivel,
  destaque,
  primeiro,
  ultimo,
  miniatura,
}: {
  id: string;
  nome: string;
  preco: string;
  precoPromo: string | null;
  disponivel: boolean;
  destaque: boolean;
  primeiro: boolean;
  ultimo: boolean;
  miniatura: React.ReactNode;
}) {
  const [, mover] = useActionState(moverProduto, null);
  const [, alternar] = useActionState(alternarDisponivel, null);

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3 ${
        disponivel ? "" : "opacity-60"
      }`}
    >
      <form action={mover}>
        <input type="hidden" name="id" value={id} />
        <Ordem primeiro={primeiro} ultimo={ultimo} />
      </form>

      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-creme">
        {miniatura ?? (
          <span className="grid size-full place-items-center text-[0.55rem] text-tinta-tenue">
            sem foto
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-cacau">
          {nome}
          {destaque && (
            <span className="rounded-full bg-oliva px-2 py-0.5 text-[0.55rem] text-creme-alto">
              destaque
            </span>
          )}
        </p>
        <p className="text-xs text-tinta-suave">
          {precoPromo ? (
            <>
              <s className="text-tinta-tenue">{preco}</s>{" "}
              <span className="font-medium text-terracota">{precoPromo}</span>
            </>
          ) : (
            preco
          )}
        </p>
      </div>

      {/* Ligar e desligar sem precisar abrir o item: é a mudança mais comum do
          dia a dia, tipo "acabou a coxinha". */}
      <form action={alternar}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className={`btn rounded-full px-3 py-1.5 text-[0.65rem] font-medium transition-colors ${
            disponivel
              ? "bg-oliva/12 text-oliva-escuro hover:bg-oliva/20"
              : "bg-terracota/12 text-terracota hover:bg-terracota/20"
          }`}
        >
          {disponivel ? "Tem hoje" : "Não tem hoje"}
        </button>
      </form>

      <Link
        href={`/admin/cardapio/${id}`}
        className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-cacau"
      >
        Editar
      </Link>
    </li>
  );
}
