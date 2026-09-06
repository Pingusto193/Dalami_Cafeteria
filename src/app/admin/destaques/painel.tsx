"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { Aviso, Cartao, Excluir, Interruptor, Ordem, Salvar, Selecao } from "../componentes";
import { apagarDestaque, moverDestaque, salvarDestaque } from "../acoes-conteudo";

type D = {
  id: string;
  produtoId: string | null;
  nome: string;
  imagem: string | null;
  ativo: boolean;
  disponivel: boolean;
};

export function PainelDestaques({
  destaques,
  produtos,
}: {
  destaques: D[];
  produtos: { valor: string; rotulo: string }[];
}) {
  const [criando, setCriando] = useState(false);
  const [novo, acaoNovo] = useActionState(salvarDestaque, null);
  const [editado, acaoEditar] = useActionState(salvarDestaque, null);
  const [apagado, acaoApagar] = useActionState(apagarDestaque, null);
  const [, acaoMover] = useActionState(moverDestaque, null);

  return (
    <div className="max-w-3xl space-y-5">
      <Cartao>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-cacau">
            {destaques.length} {destaques.length === 1 ? "destaque" : "destaques"}
          </h2>
          {!criando && produtos.length > 0 && (
            <button
              type="button"
              onClick={() => setCriando(true)}
              className="btn rounded-full border border-cacau/20 px-4 py-2 text-xs font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
            >
              Novo destaque
            </button>
          )}
        </div>

        <Aviso resultado={novo} />
        <Aviso resultado={apagado} />

        {criando && (
          <form action={acaoNovo} className="mt-5 space-y-4 rounded-xl border border-tinta/12 bg-creme p-4">
            <Selecao
              nome="produto"
              rotulo="Qual item do cardápio"
              opcoes={produtos}
              dica="Clicar no destaque leva a pessoa direto para esse item."
            />
            <Interruptor nome="ativo" rotulo="Mostrar no site agora" ligado />
            <div className="flex items-center gap-3">
              <Salvar>Criar destaque</Salvar>
              <button
                type="button"
                onClick={() => setCriando(false)}
                className="btn rounded-full px-4 py-2 text-sm text-tinta-tenue hover:text-cacau"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {destaques.length === 0 ? (
          <p className="mt-5 text-sm text-tinta-tenue">
            Nenhum destaque ainda. Sem destaques, o topo da página inicial não aparece.
          </p>
        ) : (
          <ul className="mt-5 space-y-2">
            {destaques.map((d, i) => (
              <li
                key={d.id}
                className={`flex items-center gap-3 rounded-xl border border-tinta/10 p-3 ${
                  d.ativo ? "" : "opacity-60"
                }`}
              >
                <form action={acaoMover}>
                  <input type="hidden" name="id" value={d.id} />
                  <Ordem primeiro={i === 0} ultimo={i === destaques.length - 1} />
                </form>

                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-creme">
                  {d.imagem ? (
                    <Image src={d.imagem} alt="" fill sizes="48px" className="object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-[0.55rem] text-tinta-tenue">
                      sem foto
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-cacau">{d.nome}</p>
                  {!d.disponivel && (
                    // O site esconde destaque de item indisponível sozinho.
                    // Dizer isso aqui evita a pergunta "por que sumiu?".
                    <p className="text-xs text-terracota">
                      Esse item está marcado como indisponível, então não aparece no site.
                    </p>
                  )}
                </div>

                <form action={acaoEditar} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={d.id} />
                  <input type="hidden" name="produto" value={d.produtoId ?? ""} />
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-tinta-suave">
                    <input
                      type="checkbox"
                      name="ativo"
                      defaultChecked={d.ativo}
                      className="size-4 accent-[var(--color-oliva)]"
                    />
                    no site
                  </label>
                  <button
                    type="submit"
                    className="btn rounded-full px-3 py-1.5 text-xs text-tinta-suave transition-colors hover:text-cacau"
                  >
                    Aplicar
                  </button>
                </form>

                <form action={acaoApagar}>
                  <input type="hidden" name="id" value={d.id} />
                  <Excluir rotulo="Remover" />
                </form>
              </li>
            ))}
          </ul>
        )}

        <Aviso resultado={editado} />
      </Cartao>
    </div>
  );
}
