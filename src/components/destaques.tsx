"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { formatarPreco, type DestaqueView } from "@/lib/formato";

const INTERVALO_MS = 6500;

/**
 * Hero de destaques.
 *
 * Layout: texto à esquerda sobre o creme, e uma caixa de imagem menor à
 * direita. Texto sobre foto exigiria uma camada escura por cima para manter
 * contraste, e escurecer a foto de um bolo é justamente perder o produto.
 * Separando os dois, a foto fica limpa e o texto fica legível de graça.
 *
 * O que o admin controla: quais itens aparecem, em que ordem, e por quanto
 * tempo (via startsAt/endsAt). O layout e a animação são fixos no código,
 * então não há como quebrar a seção pelo painel.
 *
 * Movimento e acessibilidade:
 *   - `prefers-reduced-motion` desliga o Ken Burns E o avanço automático.
 *     Quem pediu menos movimento não quer um carrossel girando sozinho.
 *   - o avanço pausa no hover e no foco de teclado, para ninguém perder o
 *     item que estava lendo.
 *   - setas e barras são botões de verdade, alcançáveis por tab.
 */
export function Destaques({ destaques }: { destaques: DestaqueView[] }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [semMovimento, setSemMovimento] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const aplicar = () => setSemMovimento(mq.matches);
    aplicar();
    // Escutado ao vivo: a preferência pode mudar no meio da sessão.
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  const avancar = useCallback(() => {
    setAtual((i) => (i + 1) % destaques.length);
  }, [destaques.length]);

  useEffect(() => {
    if (destaques.length < 2 || pausado || semMovimento) return;
    const id = setInterval(avancar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [destaques.length, pausado, semMovimento, avancar]);

  if (destaques.length === 0) return null;

  const slide = destaques[atual];
  const precoFinal = slide.precoPromo ?? slide.preco;
  const varios = destaques.length > 1;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da casa"
      // Só o foco por teclado pausa em nível de seção inteira: alguém
      // navegando com Tab não pode ter a bolinha trocar embaixo do dedo. O
      // mouse é tratado à parte, só na foto — ver comentário mais abaixo.
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-9 px-5 pt-12 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-16 lg:pb-20">
        {/* --- Texto --------------------------------------------------- */}
        <div className="order-2 lg:order-1">
          <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
            Destaque da casa
          </p>

          <h2
            // key força o React a remontar o título a cada troca, então a
            // animação de entrada roda de novo em vez de o texto só trocar.
            key={slide.id}
            className="mt-4 max-w-[16ch] font-display text-[clamp(2.1rem,5.4vw,3.4rem)] leading-[1.02] font-semibold text-cacau"
          >
            {slide.titulo}
          </h2>

          <div className="mt-6 h-px w-20 bg-dourado/60" />

          {slide.texto && (
            <p className="mt-6 max-w-[48ch] text-[1.05rem] leading-relaxed text-tinta-suave">
              {slide.texto}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-5">
            {precoFinal !== null && (
              <span className="flex items-baseline gap-2">
                {slide.precoPromo !== null && slide.preco !== null && (
                  <s className="text-sm text-tinta-tenue">{formatarPreco(slide.preco)}</s>
                )}
                <span
                  className={`font-display text-2xl font-semibold ${
                    slide.precoPromo !== null ? "text-terracota" : "text-cacau"
                  }`}
                >
                  {formatarPreco(precoFinal)}
                </span>
              </span>
            )}

            <Link
              href={slide.link ?? (slide.slug ? `/cardapio#${slide.slug}` : "/cardapio")}
              className="btn rounded-full bg-oliva px-6 py-3 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
            >
              Ver no cardápio
            </Link>
          </div>

          {/* --- Controles -----------------------------------------------
              Só as barras. Elas já servem de botão para pular direto para um
              destaque, então as setas eram um segundo jeito de fazer a mesma
              coisa ocupando espaço. */}
          {varios && (
            <div className="mt-9 flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {destaques.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setAtual(i)}
                    aria-label={`Ir para o destaque ${i + 1}: ${d.titulo ?? ""}`}
                    aria-current={i === atual}
                    className="btn grid h-7 place-items-center px-0.5"
                  >
                    <span
                      className="relative block h-[3px] overflow-hidden rounded-full bg-tinta/18 transition-all duration-500"
                      style={{ width: i === atual ? "2.4rem" : "0.9rem" }}
                    >
                      {i === atual && (
                        <span
                          // key={atual} reinicia a animação a cada troca: sem
                          // isso o React reaproveita o nó e a barra continua
                          // de onde parou.
                          key={atual}
                          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-terracota"
                          style={
                            semMovimento
                              ? { transform: "scaleX(1)" }
                              : {
                                  animation: `encher ${INTERVALO_MS}ms linear forwards`,
                                  animationPlayState: pausado ? "paused" : "running",
                                }
                          }
                        />
                      )}
                      {i < atual && (
                        <span className="absolute inset-0 rounded-full bg-terracota/40" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- Caixa de imagem ------------------------------------------
            O mouse pausa só aqui, na foto, não na seção inteira. Antes o
            gatilho era o <section> todo — texto, preço, botão, bolinhas — uma
            área enorme que ocupa quase a largura da tela no topo da página.
            Bastava o mouse ficar parado lendo o texto para o carrossel travar
            de vez, e parecia bug de verdade, não pausa intencional. Aqui, só
            quem está olhando a foto em si segura a troca. */}
        <div
          className="relative order-1 lg:order-2"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
        >
          <div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem] bg-creme sm:aspect-square lg:aspect-4/5">
            {destaques.map((d, i) => (
              <div
                key={d.id}
                className="absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
                style={{ opacity: i === atual ? 1 : 0 }}
                aria-hidden={i !== atual}
              >
                {d.imagem ? (
                  <div
                    className={`relative size-full ${
                      i === atual && !semMovimento ? "kenburns" : ""
                    }`}
                  >
                    <Image
                      src={d.imagem.url}
                      alt={d.imagem.alt}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 90vw, 46vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-full bg-oliva" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leitor de tela: anuncia a troca sem depender da animação. */}
      <p className="sr-only" aria-live="polite">
        Destaque {atual + 1} de {destaques.length}: {slide.titulo}
      </p>
    </section>
  );
}
