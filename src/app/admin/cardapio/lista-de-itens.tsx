"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { ListaOrdenavel } from "../ordenavel";
import { reordenar } from "../acoes-ordem";
import { alternarDisponivel } from "./acoes";

export type ItemDaLista = {
  id: string;
  nome: string;
  preco: string;
  precoPromo: string | null;
  disponivel: boolean;
  destaque: boolean;
  imagemUrl: string | null;
};

export function ListaDeItens({ itens }: { itens: ItemDaLista[] }) {
  const [, alternar] = useActionState(alternarDisponivel, null);

  return (
    <ListaOrdenavel
      itens={itens}
      aoReordenar={(ids) => reordenar("product", ids)}
      className="space-y-2"
    >
      {(p) => (
        <div
          className={`flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3 ${
            p.disponivel ? "" : "opacity-60"
          }`}
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-creme">
            {p.imagemUrl ? (
              <Image src={p.imagemUrl} alt="" fill sizes="48px" className="object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-[0.55rem] text-tinta-tenue">
                sem foto
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-medium text-cacau">
              {p.nome}
              {p.destaque && (
                <span className="rounded-full bg-oliva px-2 py-0.5 text-[0.55rem] text-creme-alto">
                  destaque
                </span>
              )}
            </p>
            <p className="text-xs text-tinta-suave">
              {p.precoPromo ? (
                <>
                  <s className="text-tinta-tenue">{p.preco}</s>{" "}
                  <span className="font-medium text-terracota">{p.precoPromo}</span>
                </>
              ) : (
                p.preco
              )}
            </p>
          </div>

          {/* Ligar e desligar sem abrir o item: é a mudança mais comum do dia a
              dia, tipo "acabou a coxinha".

              É um interruptor, e não um botão de texto, porque um botão
              escrito "Tem hoje" parece que ele MOSTRA um estado, e a pessoa
              não descobre que dá para clicar até clicar sem querer. Um
              interruptor já se apresenta como coisa de ligar e desligar. */}
          <form action={alternar} className="shrink-0">
            <input type="hidden" name="id" value={p.id} />
            <button
              type="submit"
              role="switch"
              aria-checked={p.disponivel}
              title={
                p.disponivel
                  ? "Está à venda. Clique para marcar que acabou."
                  : "Marcado como esgotado. Clique para voltar a vender."
              }
              className="btn flex items-center gap-2 rounded-full px-2 py-1.5 transition-colors hover:bg-tinta/5"
            >
              <span
                aria-hidden="true"
                className={`relative block h-5 w-9 rounded-full transition-colors ${
                  p.disponivel ? "bg-oliva" : "bg-tinta/25"
                }`}
              >
                <span
                  className={`absolute top-0.5 block size-4 rounded-full bg-creme-alto transition-all ${
                    p.disponivel ? "left-[1.15rem]" : "left-0.5"
                  }`}
                />
              </span>
              <span
                className={`text-[0.68rem] font-medium ${
                  p.disponivel ? "text-oliva-escuro" : "text-tinta-tenue"
                }`}
              >
                {p.disponivel ? "Tem hoje" : "Acabou"}
              </span>
            </button>
          </form>

          <Link
            href={`/admin/cardapio/${p.id}`}
            className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-cacau"
          >
            Editar
          </Link>
        </div>
      )}
    </ListaOrdenavel>
  );
}
