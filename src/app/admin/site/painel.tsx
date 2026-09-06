"use client";

import { useActionState } from "react";
import {
  Area,
  Aviso,
  Campo,
  Cartao,
  EscolherImagem,
  Salvar,
  type ImagemDisponivel,
} from "../componentes";
import { ListaOrdenavel } from "../ordenavel";
import { reordenar } from "../acoes-ordem";
import { alternarSecao, salvarSite } from "../acoes-conteudo";

type Dados = {
  nome: string;
  frase: string;
  regiao: string;
  recado: string;
  tituloBusca: string;
  descricaoBusca: string;
  logo: ImagemDisponivel | null;
  favicon: ImagemDisponivel | null;
  imagemCompartilhar: ImagemDisponivel | null;
};

type Secao = {
  id: string;
  chave: string;
  nome: string;
  explica: string;
  visivel: boolean;
};

export function PainelSite({
  dados,
  secoes,
  imagens,
}: {
  dados: Dados;
  secoes: Secao[];
  imagens: ImagemDisponivel[];
}) {
  const [salvo, acaoSalvar] = useActionState(salvarSite, null);
  const [alternado, acaoAlternar] = useActionState(alternarSecao, null);

  return (
    <div className="max-w-3xl space-y-6">
      <form action={acaoSalvar} className="space-y-6">
        <Cartao className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-cacau">A casa</h2>

          <Campo nome="nome" rotulo="Nome da casa" valor={dados.nome} obrigatorio />
          <Campo
            nome="frase"
            rotulo="Frase do rodapé"
            valor={dados.frase}
            dica="A frase que fecha o site, embaixo do nome."
          />
        </Cartao>

        <Cartao className="space-y-5">
          <h2 className="font-display text-lg font-semibold text-cacau">Onde a loja fica</h2>

          <Campo
            nome="regiao"
            rotulo="Bairro e cidade"
            valor={dados.regiao}
            placeholder="Bairro Ingleses, Florianópolis - SC"
            dica="Aparece na faixa verde da página inicial."
          />
          <Campo
            nome="recado"
            rotulo="Recado curto"
            valor={dados.recado}
            placeholder="Venha nos visitar."
            dica="Uma frase de convite, logo abaixo do bairro."
          />
        </Cartao>

        <Cartao className="space-y-5">
          <div>
            <h2 className="font-display text-lg font-semibold text-cacau">
              Quando alguém compartilha o site
            </h2>
            <p className="mt-1 text-sm text-tinta-suave">
              É o que aparece no Google e na prévia do link quando o site é mandado no
              WhatsApp ou no Instagram.
            </p>
          </div>

          <Campo
            nome="tituloBusca"
            rotulo="Título"
            valor={dados.tituloBusca}
            dica="Curto e direto. Uns 60 caracteres."
          />
          <Area
            nome="descricaoBusca"
            rotulo="Descrição"
            valor={dados.descricaoBusca}
            linhas={3}
            dica="Duas linhas dizendo o que a casa é e onde fica."
          />
          <EscolherImagem
            nome="imagemCompartilhar"
            rotulo="Foto da prévia do link"
            atual={dados.imagemCompartilhar}
            disponiveis={imagens}
            dica="Escolha uma foto bonita e horizontal. É a imagem que aparece no WhatsApp."
          />
        </Cartao>

        <Cartao className="space-y-6">
          <h2 className="font-display text-lg font-semibold text-cacau">Marca</h2>

          <EscolherImagem
            nome="logo"
            rotulo="Logo"
            atual={dados.logo}
            disponiveis={imagens}
            dica="Enquanto não tiver o arquivo do logo em alta, o site mostra o nome escrito."
          />
          <EscolherImagem
            nome="favicon"
            rotulo="Ícone da aba do navegador"
            atual={dados.favicon}
            disponiveis={imagens}
            dica="Uma imagem quadrada e simples, que fica legível bem pequena."
          />
        </Cartao>

        <Aviso resultado={salvo} />
        <Salvar>Salvar dados do site</Salvar>
      </form>

      <Cartao>
        <h2 className="font-display text-lg font-semibold text-cacau">
          Seções da página inicial
        </h2>
        <p className="mt-1 text-sm text-tinta-suave">
          Ligue, desligue e arraste pela alça para mudar a ordem das partes da
          página. O desenho de cada seção é fixo, então não tem como bagunçar o
          site por aqui.
        </p>

        <Aviso resultado={alternado} />

        <div className="mt-5">
          <ListaOrdenavel
            itens={secoes}
            aoReordenar={(ids) => reordenar("siteSection", ids)}
            className="space-y-2"
          >
            {(sec) => (
              <div className="flex items-center gap-3 rounded-xl border border-tinta/10 bg-creme-alto p-3">
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${sec.visivel ? "text-cacau" : "text-tinta-tenue"}`}>
                    {sec.nome}
                  </p>
                  <p className="text-xs text-tinta-tenue">{sec.explica}</p>
                </div>

                <form action={acaoAlternar}>
                  <input type="hidden" name="chave" value={sec.chave} />
                  <button
                    type="submit"
                    className={`btn rounded-full px-3.5 py-1.5 text-[0.65rem] font-medium transition-colors ${
                      sec.visivel
                        ? "bg-oliva/12 text-oliva-escuro hover:bg-oliva/20"
                        : "bg-tinta/10 text-tinta-suave hover:bg-tinta/16"
                    }`}
                  >
                    {sec.visivel ? "Aparece" : "Escondida"}
                  </button>
                </form>
              </div>
            )}
          </ListaOrdenavel>
        </div>
      </Cartao>
    </div>
  );
}
