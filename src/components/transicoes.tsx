"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Transição entre páginas: três quadros que sobem.
 *
 * A ordem importa e é o motivo deste componente existir. Se a página trocasse
 * no instante do clique, a página nova apareceria por baixo enquanto os
 * quadros ainda estão subindo, e o efeito viraria um piscar. Então:
 *
 *   1. o clique num link interno é interceptado
 *   2. os quadros sobem até fechar a tela  (fase "cobrindo")
 *   3. só então a navegação acontece, escondida atrás deles
 *   4. os quadros continuam subindo e saem    (fase "revelando")
 *
 * Quem tem "reduzir movimento" ligado não passa por nada disso: o clique segue
 * o caminho normal do navegador e a troca é instantânea.
 */

/** Duração da animação (0,55s) mais o atraso do último quadro (0,18s). */
const DUR_COBRE = 750;
const DUR_REVELA = 750;

/** Se a rota não mudar nesse tempo, revela mesmo assim em vez de travar. */
const SOCORRO = 2500;

type Fase = "oculto" | "cobrindo" | "revelando";

export function TransicaoDePagina() {
  const router = useRouter();
  const caminho = usePathname();
  const [fase, setFase] = useState<Fase>("oculto");
  const destino = useRef<string | null>(null);
  const navegando = useRef(false);

  // --- 1. Intercepta o clique -----------------------------------------------
  useEffect(() => {
    function aoClicar(e: MouseEvent) {
      // Uma transição por vez.
      if (navegando.current) return;

      // Deixa passar: clique do meio, com modificador, ou já tratado por outro.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const alvo = e.target as HTMLElement | null;
      const link = alvo?.closest("a");
      if (!link) return;

      // Deixa passar: link externo, nova aba, download.
      if (link.target && link.target !== "_self") return;
      if (link.hasAttribute("download")) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:")) return;
      if (href.startsWith("#")) return;

      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      // Deixa passar: âncora dentro da própria página. Aí a rolagem é o efeito,
      // e cobrir a tela para descer duas seções seria exagero.
      if (url.pathname === window.location.pathname) return;

      // O painel não recebe transição. Lá a pessoa está trabalhando, e meio
      // segundo de cortina a cada clique vira atraso, não charme.
      if (url.pathname.startsWith("/admin")) return;
      if (window.location.pathname.startsWith("/admin")) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // stopPropagation junto com preventDefault: o <Link> do Next tem o
      // próprio handler de clique, e sem barrar a propagação ele navegaria
      // na hora, por baixo da cortina que mal começou a subir.
      e.preventDefault();
      e.stopPropagation();

      destino.current = url.pathname + url.search + url.hash;
      navegando.current = true;
      setFase("cobrindo");
    }

    // Fase de CAPTURA. O React registra os handlers dele na raiz da aplicação,
    // então um listener de bolha no document rodaria depois do <Link> já ter
    // navegado. Na captura este código roda primeiro.
    document.addEventListener("click", aoClicar, true);
    return () => document.removeEventListener("click", aoClicar, true);
  }, []);

  // --- 2. Cobriu, então navega ----------------------------------------------
  useEffect(() => {
    if (fase !== "cobrindo") return;

    const irPara = setTimeout(() => {
      if (destino.current) router.push(destino.current);
    }, DUR_COBRE);

    // Se a rota não mudar (link para a mesma página, erro de navegação), sai
    // da cortina em vez de deixar a tela coberta para sempre.
    const socorro = setTimeout(() => {
      if (navegando.current) {
        navegando.current = false;
        setFase("revelando");
        setTimeout(() => setFase("oculto"), DUR_REVELA);
      }
    }, SOCORRO);

    return () => {
      clearTimeout(irPara);
      clearTimeout(socorro);
    };
  }, [fase, router]);

  // --- 3. A rota mudou, então revela ----------------------------------------
  useEffect(() => {
    if (!navegando.current) return;
    navegando.current = false;

    setFase("revelando");
    const id = setTimeout(() => setFase("oculto"), DUR_REVELA);
    return () => clearTimeout(id);
  }, [caminho]);

  if (fase === "oculto") return null;

  return (
    <div
      // A chave muda entre as fases, então o React monta um nó novo e a
      // animação da fase seguinte começa do zero em vez de ser ignorada.
      key={fase}
      className={`transicao transicao-${fase}`}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </div>
  );
}
