"use client";

import { useActionState, useState } from "react";
import { Aviso, Campo, Cartao, Recolhivel, Salvar } from "../componentes";
import { salvarTextoDaSecao } from "../acoes-conteudo";

export type TextoDaSecao = {
  chave: string;
  nome: string;
  explica: string;
  etiqueta: string;
  titulo: string;
  /** Seções cuja frase grande vem de outro lugar não mostram o campo. */
  temTitulo: boolean;
};

function Formulario({ secao, aoFechar }: { secao: TextoDaSecao; aoFechar: () => void }) {
  const [estado, acao] = useActionState(salvarTextoDaSecao, null);

  return (
    <form action={acao} className="space-y-4 rounded-xl border border-tinta/12 bg-creme p-4">
      <input type="hidden" name="chave" value={secao.chave} />

      <Campo
        nome="etiqueta"
        rotulo="Palavrinha de cima"
        valor={secao.etiqueta}
        dica="O texto pequeno em maiúsculas que aparece acima do título."
      />

      {secao.temTitulo ? (
        <Campo
          nome="titulo"
          rotulo="Frase grande"
          valor={secao.titulo}
          dica="O título em letra grande da seção."
        />
      ) : (
        <>
          <input type="hidden" name="titulo" value={secao.titulo} />
          <p className="text-xs text-tinta-tenue">
            Esta seção não tem frase grande própria: o título dela vem do conteúdo
            (o nome do item em destaque, o título da encomenda, ou o do bloco Sobre).
          </p>
        </>
      )}

      <Aviso resultado={estado} />

      <div className="flex items-center gap-3">
        <Salvar />
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

/**
 * Edição dos textos das seções da home.
 *
 * Existe porque essas frases estavam escritas no código. Quando o cardápio
 * mudou, a home continuou prometendo "café, doce e salgado" sem ter mais café
 * nem salgado, e não havia como corrigir sem mexer no código.
 */
export function TextosDasSecoes({ secoes }: { secoes: TextoDaSecao[] }) {
  const [editando, setEditando] = useState<string | null>(null);

  return (
    <Cartao>
      <h2 className="font-display text-lg font-semibold text-cacau">
        Frases das seções
      </h2>
      <p className="mt-1 text-sm text-tinta-suave">
        Os títulos que aparecem em cada parte da página inicial. Mude aqui quando
        o que você vende mudar.
      </p>

      <ul className="mt-5 divide-y divide-tinta/8">
        {secoes.map((s) => (
          <li key={s.chave} className="py-3">
            <Recolhivel aberto={editando === s.chave}>
              <Formulario secao={s} aoFechar={() => setEditando(null)} />
            </Recolhivel>

            <Recolhivel aberto={editando !== s.chave}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-cacau">{s.nome}</p>
                  <p className="truncate text-xs text-tinta-tenue">
                    {s.etiqueta || "(sem palavrinha)"}
                    {s.temTitulo ? ` · ${s.titulo || "(sem frase)"}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditando(s.chave)}
                  className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-cacau"
                >
                  Editar
                </button>
              </div>
            </Recolhivel>
          </li>
        ))}
      </ul>
    </Cartao>
  );
}
