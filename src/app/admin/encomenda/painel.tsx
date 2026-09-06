"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
  Area,
  Aviso,
  Campo,
  Cartao,
  Excluir,
  Interruptor,
  Salvar,
  Selecao,
} from "../componentes";
import {
  adicionarItemEncomenda,
  removerItemEncomenda,
  salvarEncomenda,
} from "../acoes-conteudo";
import { ListaOrdenavel } from "../ordenavel";
import { reordenar } from "../acoes-ordem";

type Item = {
  id: string;
  nome: string;
  categoria: string;
  preco: string;
  imagem: string | null;
  disponivel: boolean;
};

export function PainelEncomenda({
  secao,
  itens,
  disponiveis,
}: {
  secao: { titulo: string; descricao: string; whatsapp: string; ativa: boolean };
  itens: Item[];
  disponiveis: { valor: string; rotulo: string }[];
}) {
  const [salvo, acaoSalvar] = useActionState(salvarEncomenda, null);
  const [adicionado, acaoAdicionar] = useActionState(adicionarItemEncomenda, null);
  const [removido, acaoRemover] = useActionState(removerItemEncomenda, null);

  return (
    <div className="max-w-3xl space-y-6">
      <form action={acaoSalvar}>
        <Cartao className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-cacau">Texto da página</h2>

          <Campo nome="titulo" rotulo="Título" valor={secao.titulo} obrigatorio />

          <Area
            nome="descricao"
            rotulo="Texto de apresentação"
            valor={secao.descricao}
            linhas={5}
            dica="Escreva normalmente. Deixe uma linha em branco entre um parágrafo e outro."
          />

          <Campo
            nome="whatsapp"
            rotulo="WhatsApp para receber os pedidos"
            valor={secao.whatsapp}
            placeholder="48988887777"
            dica="Com DDD, só números. É para onde vai o botão da página."
          />

          <Interruptor
            nome="ativa"
            rotulo="Mostrar a encomenda no site"
            ligado={secao.ativa}
            dica="Desligue para tirar a página de encomenda e o botão da página inicial."
          />

          <Aviso resultado={salvo} />
          <Salvar />
        </Cartao>
      </form>

      <Cartao>
        <h2 className="font-display text-lg font-semibold text-cacau">
          Cardápio de encomenda
        </h2>
        <p className="mt-1.5 text-sm text-tinta-suave">
          Só o que estiver nesta lista aparece na página de encomenda. Arraste pela
          alça para mudar a ordem. Para criar um item novo, use a tela de Cardápio e
          depois adicione ele aqui.
        </p>

        <Aviso resultado={adicionado} />
        <Aviso resultado={removido} />

        {disponiveis.length > 0 && (
          <form action={acaoAdicionar} className="mt-5 flex flex-wrap items-end gap-3">
            <div className="min-w-[16rem] flex-1">
              <Selecao nome="produto" rotulo="Adicionar item" opcoes={disponiveis} />
            </div>
            <Salvar>Adicionar</Salvar>
          </form>
        )}

        {itens.length === 0 ? (
          <p className="mt-5 text-sm text-tinta-tenue">
            A lista está vazia. A página de encomenda vai mostrar só o texto e o botão.
          </p>
        ) : (
          <div className="mt-5">
            <ListaOrdenavel
              itens={itens}
              aoReordenar={(ids) => reordenar("orderSectionItem", ids)}
              className="space-y-2"
            >
              {(it) => (
                <div
                  className={`flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3 ${
                    it.disponivel ? "" : "opacity-60"
                  }`}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-creme">
                    {it.imagem ? (
                      <Image src={it.imagem} alt="" fill sizes="48px" className="object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-[0.55rem] text-tinta-tenue">
                        sem foto
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-cacau">{it.nome}</p>
                    <p className="text-xs text-tinta-tenue">
                      {it.categoria} · {it.preco}
                      {!it.disponivel && " · marcado como indisponível, não aparece no site"}
                    </p>
                  </div>

                  <form action={acaoRemover}>
                    <input type="hidden" name="id" value={it.id} />
                    <Excluir rotulo="Tirar da lista" />
                  </form>
                </div>
              )}
            </ListaOrdenavel>
          </div>
        )}
      </Cartao>
    </div>
  );
}
