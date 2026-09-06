"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import {
  Area,
  Aviso,
  Campo,
  Cartao,
  EscolherImagem,
  Excluir,
  Interruptor,
  Recolhivel,
  Salvar,
  type ImagemDisponivel,
} from "../componentes";
import { ListaOrdenavel } from "../ordenavel";
import { reordenar } from "../acoes-ordem";
import {
  removerItemEncomenda,
  salvarEncomenda,
  salvarItemEncomenda,
} from "../acoes-conteudo";

export type ItemEncomenda = {
  id: string;
  produtoId: string;
  nome: string;
  descricao: string;
  preco: string;
  imagem: ImagemDisponivel | null;
};

function FormularioItem({
  item,
  imagens,
  aoFechar,
}: {
  item?: ItemEncomenda;
  imagens: ImagemDisponivel[];
  aoFechar: () => void;
}) {
  const [estado, acao] = useActionState(salvarItemEncomenda, null);

  return (
    <form action={acao} className="space-y-4 rounded-xl border border-tinta/12 bg-creme p-4">
      {item && <input type="hidden" name="id" value={item.produtoId} />}

      <Campo nome="nome" rotulo="Nome do item" valor={item?.nome} obrigatorio />

      <Area
        nome="descricao"
        rotulo="Descrição"
        valor={item?.descricao}
        linhas={2}
        dica="Uma linha sobre o item. Ex.: serve de 12 a 15 pessoas."
      />

      <Campo
        nome="preco"
        rotulo="Preço"
        valor={item?.preco}
        placeholder="120,00"
        obrigatorio
        dica="Use vírgula para os centavos."
      />

      <EscolherImagem
        nome="imagem"
        rotulo="Foto do item"
        atual={item?.imagem}
        disponiveis={imagens}
      />

      <Aviso resultado={estado} />

      <div className="flex items-center gap-3">
        <Salvar>{item ? "Salvar" : "Criar item"}</Salvar>
        <button
          type="button"
          onClick={aoFechar}
          className="btn rounded-full px-4 py-2 text-sm text-tinta-tenue hover:text-cacau"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function PainelEncomenda({
  secao,
  itens,
  imagens,
}: {
  secao: { titulo: string; descricao: string; whatsapp: string; ativa: boolean };
  itens: ItemEncomenda[];
  imagens: ImagemDisponivel[];
}) {
  const [salvo, acaoSalvar] = useActionState(salvarEncomenda, null);
  const [removido, acaoRemover] = useActionState(removerItemEncomenda, null);
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

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
            linhas={4}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-cacau">
              O que fazemos por encomenda
            </h2>
            <p className="mt-1 text-sm text-tinta-suave">
              Estes itens aparecem só na página de encomenda, nunca no cardápio do
              dia a dia. Arraste pela alça para mudar a ordem.
            </p>
          </div>
          {!criando && (
            <button
              type="button"
              onClick={() => {
                setCriando(true);
                setEditando(null);
              }}
              className="btn rounded-full border border-cacau/20 px-4 py-2 text-xs font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
            >
              Novo item
            </button>
          )}
        </div>

        <Aviso resultado={removido} />

        <Recolhivel aberto={criando} className="mt-5">
          <FormularioItem imagens={imagens} aoFechar={() => setCriando(false)} />
        </Recolhivel>

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
                <>
                  <Recolhivel aberto={editando === it.id}>
                    <FormularioItem
                      item={it}
                      imagens={imagens}
                      aoFechar={() => setEditando(null)}
                    />
                  </Recolhivel>

                  <Recolhivel aberto={editando !== it.id}>
                    <div className="flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-creme">
                        {it.imagem ? (
                          <Image
                            src={it.imagem.url}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="grid size-full place-items-center text-[0.55rem] text-tinta-tenue">
                            sem foto
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-cacau">{it.nome}</p>
                        <p className="truncate text-xs text-tinta-tenue">
                          R$ {it.preco}
                          {it.descricao ? ` · ${it.descricao}` : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setEditando(it.id);
                          setCriando(false);
                        }}
                        className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-cacau"
                      >
                        Editar
                      </button>

                      <form action={acaoRemover}>
                        <input type="hidden" name="id" value={it.id} />
                        <Excluir />
                      </form>
                    </div>
                  </Recolhivel>
                </>
              )}
            </ListaOrdenavel>
          </div>
        )}
      </Cartao>
    </div>
  );
}
