"use client";

import { useActionState, useState } from "react";
import { Aviso, Campo, Cartao, Excluir, Interruptor, Salvar } from "../componentes";
import { ListaOrdenavel } from "../ordenavel";
import { reordenar } from "../acoes-ordem";
import { apagarCategoria, salvarCategoria } from "./acoes";

type Cat = {
  id: string;
  nome: string;
  descricao: string | null;
  ativa: boolean;
  quantosItens: number;
};

function Formulario({ cat, aoFechar }: { cat?: Cat; aoFechar: () => void }) {
  const [estado, acao] = useActionState(salvarCategoria, null);

  return (
    <form action={acao} className="space-y-4">
      {cat && <input type="hidden" name="id" value={cat.id} />}

      <Campo nome="nome" rotulo="Nome da categoria" valor={cat?.nome} obrigatorio />
      <Campo
        nome="descricao"
        rotulo="Descrição"
        valor={cat?.descricao}
        dica="Uma frase curta que aparece abaixo do nome no cardápio."
      />
      <Interruptor
        nome="ativa"
        rotulo="Mostrar no cardápio do site"
        ligado={cat?.ativa ?? true}
        dica="Desligue para esconder a categoria do site sem apagar nada."
      />

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

export function Categorias({ categorias }: { categorias: Cat[] }) {
  const [editando, setEditando] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [apagar, acaoApagar] = useActionState(apagarCategoria, null);

  return (
    <Cartao>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-cacau">Categorias</h2>
          <p className="mt-1 text-sm text-tinta-suave">
            Arraste pela alça à esquerda para mudar a ordem no cardápio.
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
            Nova categoria
          </button>
        )}
      </div>

      <Aviso resultado={apagar} />

      {criando && (
        <div className="mt-5 rounded-xl border border-tinta/12 bg-creme p-4">
          <Formulario aoFechar={() => setCriando(false)} />
        </div>
      )}

      <div className="mt-5">
        <ListaOrdenavel
          itens={categorias}
          aoReordenar={(ids) => reordenar("category", ids)}
          className="space-y-2"
        >
          {(c) => (
            <>
              {editando === c.id ? (
                <div className="rounded-xl border border-tinta/12 bg-creme p-4">
                  <Formulario cat={c} aoFechar={() => setEditando(null)} />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-cacau">
                      {c.nome}
                      {!c.ativa && (
                        <span className="rounded-full bg-tinta/10 px-2 py-0.5 text-[0.6rem] text-tinta-suave">
                          escondida
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-tinta-tenue">
                      {c.quantosItens} {c.quantosItens === 1 ? "item" : "itens"}
                      {c.descricao ? ` · ${c.descricao}` : ""}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditando(c.id);
                      setCriando(false);
                    }}
                    className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-cacau"
                  >
                    Editar
                  </button>

                  <form action={acaoApagar}>
                    <input type="hidden" name="id" value={c.id} />
                    <Excluir />
                  </form>
                </div>
              )}
            </>
          )}
        </ListaOrdenavel>
      </div>
    </Cartao>
  );
}
