"use client";

import Image from "next/image";
import { useActionState } from "react";
import { Aviso, Cartao, Excluir } from "../componentes";
import { apagarImagem, renomearImagem } from "../acoes-conteudo";

type Img = {
  id: string;
  url: string;
  alt: string;
  largura: number;
  altura: number;
  peso: number;
  usos: number;
};

export function PainelImagens({ imagens }: { imagens: Img[] }) {
  const [apagado, acaoApagar] = useActionState(apagarImagem, null);
  const [renomeado, acaoRenomear] = useActionState(renomearImagem, null);

  return (
    <div className="max-w-4xl space-y-5">
      <Aviso resultado={apagado} />
      <Aviso resultado={renomeado} />

      {imagens.length === 0 ? (
        <Cartao>
          <p className="text-sm text-tinta-tenue">
            Nenhuma foto ainda. Você envia fotos novas na hora de editar um item do
            cardápio ou um bloco da seção Sobre.
          </p>
        </Cartao>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {imagens.map((img) => (
            <li key={img.id}>
              <Cartao className="flex gap-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-creme">
                  <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <form action={acaoRenomear} className="space-y-2">
                    <input type="hidden" name="id" value={img.id} />
                    <label className="block">
                      <span className="font-rotulo text-[0.55rem] uppercase tracking-[0.16em] text-tinta-suave">
                        O que a foto mostra
                      </span>
                      <input
                        name="alt"
                        defaultValue={img.alt}
                        className="mt-1 w-full rounded-lg border border-tinta/15 bg-creme px-2.5 py-1.5 text-sm text-tinta outline-none focus:border-oliva"
                      />
                    </label>
                    <button
                      type="submit"
                      className="btn rounded-full px-3 py-1.5 text-xs text-tinta-suave transition-colors hover:text-cacau"
                    >
                      Salvar descrição
                    </button>
                  </form>

                  <p className="mt-2 text-[0.68rem] text-tinta-tenue">
                    {img.largura} x {img.altura} · {img.peso} KB
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span
                      className={`text-[0.68rem] ${
                        img.usos > 0 ? "text-oliva" : "text-tinta-tenue"
                      }`}
                    >
                      {img.usos > 0
                        ? `usada em ${img.usos} ${img.usos === 1 ? "lugar" : "lugares"}`
                        : "não está em uso"}
                    </span>

                    {img.usos === 0 && (
                      <form action={acaoApagar}>
                        <input type="hidden" name="id" value={img.id} />
                        <Excluir />
                      </form>
                    )}
                  </div>
                </div>
              </Cartao>
            </li>
          ))}
        </ul>
      )}

      <Cartao>
        <p className="text-xs text-tinta-tenue">
          As fotos ficam gravadas no computador onde o site roda. Quando o site for
          publicado na internet, elas precisam ir para um serviço de imagens, senão
          somem a cada atualização do site.
        </p>
      </Cartao>
    </div>
  );
}
