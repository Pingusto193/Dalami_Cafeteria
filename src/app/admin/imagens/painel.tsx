"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

/**
 * Comprime a foto NO NAVEGADOR antes de enviar.
 *
 * Foto de celular vem com 8 a 12 MB. Sem isto, o dono esperaria minutos num
 * 4G ruim e o servidor receberia um arquivo enorme à toa. Passar pelo canvas
 * também joga fora os metadados EXIF, incluindo a coordenada de GPS.
 */
async function encolherNoNavegador(arquivo: File): Promise<Blob> {
  const LADO = 1600;
  const bitmap = await createImageBitmap(arquivo);

  const escala = Math.min(1, LADO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);

  const tela = document.createElement("canvas");
  tela.width = largura;
  tela.height = altura;
  const ctx = tela.getContext("2d");
  if (!ctx) return arquivo;
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    tela.toBlob(resolve, "image/webp", 0.85),
  );
  return blob ?? arquivo;
}

/**
 * Envio de fotos para guardar.
 *
 * Esta tela é o depósito: o dono sobe as fotos aqui quando tiver tempo, e
 * depois escolhe entre elas na hora de montar um item do cardápio ou um bloco
 * da seção Sobre. Sem isto, ele só conseguiria subir foto no meio de outra
 * tarefa, o que obriga a ter a foto pronta na hora exata.
 */
function Enviar() {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState<number>(0);
  const entrada = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function aoEscolher(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []);
    if (arquivos.length === 0) return;

    setErro(null);
    setEnviando(true);
    let enviadas = 0;

    try {
      // Uma de cada vez, de propósito: várias em paralelo num 4G ruim
      // atrapalham umas às outras e a barra de progresso vira mentira.
      for (const arquivo of arquivos) {
        if (arquivo.size > 10 * 1024 * 1024) {
          setErro(`"${arquivo.name}" tem mais de 10 MB e foi pulada.`);
          continue;
        }

        const menor = await encolherNoNavegador(arquivo);
        const dados = new FormData();
        dados.append("arquivo", menor, "foto.webp");
        dados.append("alt", arquivo.name.replace(/\.[^.]+$/, ""));

        const resposta = await fetch("/admin/api/imagem", { method: "POST", body: dados });
        if (!resposta.ok) {
          const json = await resposta.json().catch(() => ({}));
          setErro(json.erro ?? `Não consegui enviar "${arquivo.name}".`);
          continue;
        }
        enviadas++;
      }

      setFeito(enviadas);
      if (enviadas > 0) router.refresh(); // busca a lista nova do servidor
    } catch {
      setErro("Não consegui ler essas fotos. Tente outras.");
    } finally {
      setEnviando(false);
      if (entrada.current) entrada.current.value = "";
    }
  }

  return (
    <Cartao>
      <h2 className="font-display text-lg font-semibold text-cacau">Enviar fotos</h2>
      <p className="mt-1.5 text-sm text-tinta-suave">
        Guarde fotos aqui para usar depois. Elas ficam disponíveis na hora de criar
        um item do cardápio ou um bloco da seção Sobre.
      </p>

      <label className="btn mt-5 inline-flex cursor-pointer rounded-full bg-oliva px-6 py-3 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro">
        {/* Sem "do computador": no celular a frase fica errada, porque a foto
            vem da galeria ou da câmera, não de computador nenhum. */}
        {enviando ? "Enviando..." : "Escolher fotos"}
        <input
          ref={entrada}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={enviando}
          onChange={aoEscolher}
        />
      </label>

      <p className="mt-3 text-xs text-tinta-tenue">
        Pode escolher várias de uma vez. As fotos são encolhidas antes de subir,
        então não precisa se preocupar com o tamanho.
      </p>

      {erro && <p className="mt-3 text-sm text-terracota">{erro}</p>}
      {feito > 0 && !erro && (
        <p className="mt-3 text-sm text-oliva-escuro">
          {feito} {feito === 1 ? "foto enviada" : "fotos enviadas"}.
        </p>
      )}
    </Cartao>
  );
}

export function PainelImagens({ imagens }: { imagens: Img[] }) {
  const [apagado, acaoApagar] = useActionState(apagarImagem, null);
  const [renomeado, acaoRenomear] = useActionState(renomearImagem, null);

  return (
    <div className="max-w-4xl space-y-5">
      <Enviar />

      <Aviso resultado={apagado} />
      <Aviso resultado={renomeado} />

      {imagens.length === 0 ? (
        <Cartao>
          <p className="text-sm text-tinta-tenue">
            Nenhuma foto guardada ainda. Use o botão acima para enviar as primeiras.
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
                        : "guardada, sem uso ainda"}
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
