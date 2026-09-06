"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatarPreco, type DestaqueView } from "@/lib/formato";

const INTERVALO_MS = 6500;

/**
 * Hero de destaques.
 *
 * O que o admin controla: quais itens aparecem, em que ordem, e por quanto
 * tempo (via startsAt/endsAt). O layout e a animação são fixos no código, então
 * não há como quebrar a seção pelo painel.
 *
 * Acessibilidade e movimento:
 *   - `prefers-reduced-motion` desliga o Ken Burns E o avanço automático.
 *     Quem pediu menos movimento não quer um carrossel girando sozinho.
 *   - o avanço pausa no hover e no foco de teclado, para ninguém perder o
 *     item que estava lendo.
 *   - as setas e os pontos são botões de verdade, alcançáveis por tab.
 */
export function Destaques({ destaques }: { destaques: DestaqueView[] }) {
  const [atual, setAtual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const [semMovimento, setSemMovimento] = useState(false);
  const regiao = useRef<HTMLDivElement>(null);

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

  const voltar = useCallback(() => {
    setAtual((i) => (i - 1 + destaques.length) % destaques.length);
  }, [destaques.length]);

  useEffect(() => {
    if (destaques.length < 2 || pausado || semMovimento) return;
    const id = setInterval(avancar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [destaques.length, pausado, semMovimento, avancar]);

  if (destaques.length === 0) return null;

  const slide = destaques[atual];
  const precoFinal = slide.precoPromo ?? slide.preco;

  return (
    <section
      ref={regiao}
      aria-roledescription="carrossel"
      aria-label="Destaques da casa"
      className="relative"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
    >
      <div className="relative isolate mx-auto max-w-[110rem] overflow-hidden rounded-b-[2rem] bg-cacau">
        {/* Palco. As imagens ficam empilhadas e trocam por crossfade. */}
        <div className="relative aspect-4/5 sm:aspect-16/10 lg:aspect-21/9">
          {destaques.map((d, i) => (
            <div
              key={d.id}
              className="absolute inset-0 transition-opacity duration-1000 ease-[cubic-bezier(0.22,0.61,0.36,1)]"
              style={{ opacity: i === atual ? 1 : 0 }}
              aria-hidden={i !== atual}
            >
              {d.imagem ? (
                <div className={`relative size-full ${i === atual && !semMovimento ? "kenburns" : ""}`}>
                  <Image
                    src={d.imagem.url}
                    alt={d.imagem.alt}
                    fill
                    priority={i === 0}
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="size-full bg-oliva" />
              )}
            </div>
          ))}

          {/* Scrim. A filmagem por baixo muda, então o texto precisa de uma
              camada escura própria para nunca perder contraste. */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(28,16,6,0.88) 0%, rgba(28,16,6,0.55) 38%, rgba(28,16,6,0.12) 68%, rgba(28,16,6,0.28) 100%)",
            }}
          />

          {/* Conteúdo do slide */}
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-6xl">
              <p className="font-rotulo text-[0.62rem] uppercase tracking-[0.34em] text-dourado-claro">
                Destaque da casa
              </p>

              <h2
                key={slide.id}
                className="mt-3 max-w-[18ch] font-display text-[clamp(1.9rem,5.5vw,3.6rem)] leading-[1.02] font-semibold text-creme-alto"
                style={{ textShadow: "0 2px 18px rgba(20,10,4,0.55)" }}
              >
                {slide.titulo}
              </h2>

              {slide.texto && (
                <p className="mt-3 max-w-[52ch] text-[0.98rem] leading-relaxed text-creme/85">
                  {slide.texto}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {precoFinal !== null && (
                  <span className="flex items-baseline gap-2">
                    {slide.precoPromo !== null && slide.preco !== null && (
                      <s className="text-sm text-creme/50">{formatarPreco(slide.preco)}</s>
                    )}
                    <span className="font-display text-2xl font-semibold text-creme-alto">
                      {formatarPreco(precoFinal)}
                    </span>
                  </span>
                )}

                <Link
                  href={slide.link ?? (slide.slug ? `/cardapio#${slide.slug}` : "/cardapio")}
                  className="btn rounded-full bg-creme-alto px-6 py-3 text-sm font-medium text-cacau transition-colors hover:bg-creme"
                >
                  Ver no cardápio
                </Link>
              </div>
            </div>
          </div>

          {/* Controles manuais, além do avanço automático. */}
          {destaques.length > 1 && (
            <>
              <button
                type="button"
                onClick={voltar}
                aria-label="Destaque anterior"
                className="btn absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-creme/25 bg-cacau/40 text-creme-alto backdrop-blur-sm transition-colors hover:bg-cacau/70 sm:left-5"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                type="button"
                onClick={avancar}
                aria-label="Próximo destaque"
                className="btn absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-creme/25 bg-cacau/40 text-creme-alto backdrop-blur-sm transition-colors hover:bg-cacau/70 sm:right-5"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Barras de progresso. A do destaque atual enche no tempo do
                  avanço automático, para a troca não pegar ninguém de
                  surpresa. Pausa junto com o carrossel no hover e no foco. */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5 sm:top-7 sm:right-7">
                {destaques.map((d, i) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setAtual(i)}
                    aria-label={`Ir para o destaque ${i + 1}: ${d.titulo ?? ""}`}
                    aria-current={i === atual}
                    className="btn group/barra grid h-7 place-items-center px-0.5"
                  >
                    <span
                      className="relative block h-[3px] overflow-hidden rounded-full bg-creme/30 transition-all duration-500"
                      style={{ width: i === atual ? "2.6rem" : "1rem" }}
                    >
                      {i === atual && (
                        <span
                          // key={atual} reinicia a animação a cada troca:
                          // sem isso o React reaproveita o nó e a barra
                          // continua de onde parou.
                          key={atual}
                          className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-dourado-claro"
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
                        <span className="absolute inset-0 rounded-full bg-dourado-claro/45" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Leitor de tela: anuncia a troca sem depender da animação. */}
      <p className="sr-only" aria-live="polite">
        Destaque {atual + 1} de {destaques.length}: {slide.titulo}
      </p>
    </section>
  );
}
