"use client";

import { useActionState, useState } from "react";
import { Aviso, Campo, Cartao, Excluir, Interruptor, Salvar } from "../componentes";
import { apagarCanal, apagarRede, salvarCanal, salvarRede } from "../acoes-conteudo";

type Link = { id: string; nome: string; url: string; ativa: boolean };

/**
 * As duas listas são a mesma coisa por dentro, então dividem um componente.
 * O que muda é a palavra que o dono lê e a ação que o formulário chama.
 */
function Lista({
  titulo,
  apoio,
  itens,
  campoAtivo,
  rotuloNome,
  rotuloUrl,
  dicaUrl,
  salvar,
  apagar,
}: {
  titulo: string;
  apoio: string;
  itens: Link[];
  campoAtivo: string;
  rotuloNome: string;
  rotuloUrl: string;
  dicaUrl: string;
  salvar: typeof salvarRede;
  apagar: typeof apagarRede;
}) {
  const [editando, setEditando] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [salvo, acaoSalvar] = useActionState(salvar, null);
  const [apagado, acaoApagar] = useActionState(apagar, null);

  function Formulario({ item }: { item?: Link }) {
    return (
      <form action={acaoSalvar} className="space-y-4 rounded-xl border border-tinta/12 bg-creme p-4">
        {item && <input type="hidden" name="id" value={item.id} />}
        <Campo nome="nome" rotulo={rotuloNome} valor={item?.nome} obrigatorio />
        <Campo nome="url" rotulo={rotuloUrl} valor={item?.url} dica={dicaUrl} obrigatorio />
        <Interruptor nome={campoAtivo} rotulo="Mostrar no site" ligado={item?.ativa ?? true} />
        <div className="flex items-center gap-3">
          <Salvar />
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setCriando(false);
            }}
            className="btn rounded-full px-4 py-2 text-sm text-tinta-tenue hover:text-cacau"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <Cartao>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-cacau">{titulo}</h2>
          <p className="mt-1 text-sm text-tinta-suave">{apoio}</p>
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
            Adicionar
          </button>
        )}
      </div>

      <Aviso resultado={salvo} />
      <Aviso resultado={apagado} />

      {criando && (
        <div className="mt-5">
          <Formulario />
        </div>
      )}

      {itens.length === 0 && !criando ? (
        <p className="mt-5 text-sm text-tinta-tenue">Nenhum link cadastrado ainda.</p>
      ) : (
        <ul className="mt-5 divide-y divide-tinta/8">
          {itens.map((it) => (
            <li key={it.id} className="py-3">
              {editando === it.id ? (
                <Formulario item={it} />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 font-medium text-cacau">
                      {it.nome}
                      {!it.ativa && (
                        <span className="rounded-full bg-tinta/10 px-2 py-0.5 text-[0.6rem] text-tinta-suave">
                          escondido
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-tinta-tenue">{it.url}</p>
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
                  <form action={acaoApagar}>
                    <input type="hidden" name="id" value={it.id} />
                    <Excluir />
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Cartao>
  );
}

export function PainelContato({ redes, canais }: { redes: Link[]; canais: Link[] }) {
  return (
    <div className="max-w-3xl space-y-6">
      <Lista
        titulo="Canais de compra"
        apoio="O botão que aparece no topo do site e no cardápio."
        itens={canais}
        campoAtivo="ativo"
        rotuloNome="Nome do canal"
        rotuloUrl="Endereço"
        dicaUrl="Cole o link da sua loja, por exemplo o endereço do iFood."
        salvar={salvarCanal}
        apagar={apagarCanal}
      />

      <Lista
        titulo="Redes sociais"
        apoio="Aparecem na seção de contato da página inicial."
        itens={redes}
        campoAtivo="ativa"
        rotuloNome="Nome da rede"
        rotuloUrl="Endereço"
        dicaUrl="Cole o link completo do seu perfil."
        salvar={salvarRede}
        apagar={apagarRede}
      />
    </div>
  );
}
