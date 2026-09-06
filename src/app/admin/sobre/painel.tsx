"use client";

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
import { apagarBloco, salvarBloco } from "../acoes-conteudo";

type Bloco = {
  id: string;
  titulo: string;
  corpo: string;
  visivel: boolean;
  imagem: ImagemDisponivel | null;
};

function Formulario({
  bloco,
  imagens,
  aoFechar,
  posicao,
}: {
  bloco?: Bloco;
  imagens: ImagemDisponivel[];
  aoFechar: () => void;
  posicao?: number;
}) {
  const [estado, acao] = useActionState(salvarBloco, null);

  return (
    <form action={acao} className="space-y-5">
      {bloco && <input type="hidden" name="id" value={bloco.id} />}

      <Campo nome="titulo" rotulo="Título do bloco" valor={bloco?.titulo} />

      <Area
        nome="corpo"
        rotulo="Texto"
        valor={bloco?.corpo}
        linhas={6}
        dica="Escreva normalmente. Deixe uma linha em branco entre um parágrafo e outro."
      />

      <EscolherImagem
        nome="imagem"
        rotulo="Foto do bloco"
        atual={bloco?.imagem}
        disponiveis={imagens}
        dica={
          posicao === undefined
            ? "O lado da foto é decidido pela posição do bloco na lista."
            : `Neste bloco a foto fica à ${posicao % 2 === 0 ? "esquerda" : "direita"}.`
        }
      />

      <Interruptor
        nome="visivel"
        rotulo="Mostrar no site"
        ligado={bloco?.visivel ?? true}
        dica="Desligue para esconder este bloco sem apagar o texto."
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

export function PainelSobre({
  blocos,
  imagens,
}: {
  blocos: Bloco[];
  imagens: ImagemDisponivel[];
}) {
  const [editando, setEditando] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [apagado, acaoApagar] = useActionState(apagarBloco, null);

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tinta-suave">
          Arraste pela alça para mudar a ordem. O lado da foto acompanha a posição.
        </p>
        {!criando && (
          <button
            type="button"
            onClick={() => {
              setCriando(true);
              setEditando(null);
            }}
            className="btn rounded-full bg-oliva px-5 py-2.5 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
          >
            Novo bloco
          </button>
        )}
      </div>

      <Aviso resultado={apagado} />

      <Recolhivel aberto={criando}>
        <Cartao>
          <Formulario imagens={imagens} aoFechar={() => setCriando(false)} />
        </Cartao>
      </Recolhivel>

      {blocos.length === 0 && !criando ? (
        <Cartao>
          <p className="text-sm text-tinta-tenue">
            Nenhum bloco ainda. Sem blocos, a seção Sobre não aparece no site.
          </p>
        </Cartao>
      ) : (
        <ListaOrdenavel
          itens={blocos}
          aoReordenar={(ids) => reordenar("contentBlock", ids)}
          className="space-y-5"
        >
          {(b, i) => (
            <Cartao>
              {/* Os dois lados ficam montados e trocam com animação, em vez de
                  um sumir de estalo e o outro aparecer no lugar. */}
              <Recolhivel aberto={editando === b.id}>
                <Formulario
                  bloco={b}
                  imagens={imagens}
                  posicao={i}
                  aoFechar={() => setEditando(null)}
                />
              </Recolhivel>

              <Recolhivel aberto={editando !== b.id}>
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-display text-lg font-semibold text-cacau">
                      {b.titulo || "(sem título)"}
                      {!b.visivel && (
                        <span className="rounded-full bg-tinta/10 px-2 py-0.5 font-rotulo text-[0.55rem] tracking-wider text-tinta-suave">
                          escondido
                        </span>
                      )}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-tinta-suave">
                      {b.corpo || "(sem texto)"}
                    </p>
                    <p className="mt-2 font-rotulo text-[0.55rem] uppercase tracking-[0.16em] text-terracota">
                      Foto à {i % 2 === 0 ? "esquerda" : "direita"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditando(b.id);
                        setCriando(false);
                      }}
                      className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-cacau"
                    >
                      Editar
                    </button>
                    <form action={acaoApagar}>
                      <input type="hidden" name="id" value={b.id} />
                      <Excluir />
                    </form>
                  </div>
                </div>
              </Recolhivel>
            </Cartao>
          )}
        </ListaOrdenavel>
      )}
    </div>
  );
}
