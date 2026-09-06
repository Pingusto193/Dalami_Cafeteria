"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  Area,
  Aviso,
  Campo,
  Cartao,
  EscolherImagem,
  Excluir,
  Interruptor,
  Salvar,
  Selecao,
  type ImagemDisponivel,
} from "../componentes";
import { apagarProduto, salvarProduto } from "./acoes";

export type ItemParaEditar = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: string;
  precoPromo: string | null;
  categoriaId: string;
  destaque: boolean;
  disponivel: boolean;
  imagem: ImagemDisponivel | null;
};

export function FormularioItem({
  item,
  categorias,
  imagens,
}: {
  item?: ItemParaEditar;
  categorias: { valor: string; rotulo: string }[];
  imagens: ImagemDisponivel[];
}) {
  const [estado, salvar] = useActionState(salvarProduto, null);
  const [apagado, apagar] = useActionState(apagarProduto, null);

  return (
    <div className="max-w-2xl space-y-5">
      <form action={salvar} className="space-y-5">
        {item && <input type="hidden" name="id" value={item.id} />}

        <Cartao className="space-y-5">
          <Campo nome="nome" rotulo="Nome do item" valor={item?.nome} obrigatorio />

          <Area
            nome="descricao"
            rotulo="Descrição"
            valor={item?.descricao}
            linhas={3}
            dica="Uma ou duas linhas sobre o item. Aparece embaixo do nome no cardápio."
          />

          <Selecao
            nome="categoria"
            rotulo="Categoria"
            valor={item?.categoriaId ?? categorias[0]?.valor}
            opcoes={categorias}
            dica="Em qual parte do cardápio este item aparece."
          />
        </Cartao>

        <Cartao className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo
              nome="preco"
              rotulo="Preço"
              valor={item?.preco}
              obrigatorio
              placeholder="12,50"
              dica="Use vírgula para os centavos."
            />
            <Campo
              nome="precoPromo"
              rotulo="Preço em promoção"
              valor={item?.precoPromo}
              placeholder="deixe vazio se não estiver em promoção"
              dica="Precisa ser menor que o preço normal."
            />
          </div>
        </Cartao>

        <Cartao>
          <EscolherImagem
            nome="imagem"
            rotulo="Foto do item"
            atual={item?.imagem}
            disponiveis={imagens}
            dica="Sem foto também funciona: a categoria vira uma lista limpa no cardápio."
          />
        </Cartao>

        <Cartao className="space-y-4">
          <Interruptor
            nome="disponivel"
            rotulo="Temos hoje"
            ligado={item?.disponivel ?? true}
            dica="Desligue quando acabar. O item continua no cardápio, marcado como indisponível."
          />
          <Interruptor
            nome="destaque"
            rotulo="Marcar como destaque"
            ligado={item?.destaque ?? false}
            dica="Coloca um selo no item dentro do cardápio."
          />
        </Cartao>

        <Aviso resultado={estado} />
        <Aviso resultado={apagado} />

        <div className="flex flex-wrap items-center gap-3">
          <Salvar>{item ? "Salvar mudanças" : "Criar item"}</Salvar>
          <Link
            href="/admin/cardapio"
            className="btn rounded-full px-4 py-2 text-sm text-tinta-tenue hover:text-cacau"
          >
            Voltar
          </Link>
        </div>
      </form>

      {item && (
        <form action={apagar} className="border-t border-tinta/10 pt-5">
          <input type="hidden" name="id" value={item.id} />
          <Excluir rotulo="Apagar este item" />
        </form>
      )}
    </div>
  );
}
