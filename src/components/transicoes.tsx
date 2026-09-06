"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Cortina de transição entre páginas.
 *
 * Como funciona: quando a rota muda, a página nova já está renderizada. Então
 * em vez de tentar segurar a navegação, a cortina entra já cobrindo a tela e
 * sai revelando o conteúdo. O efeito lê como uma passagem, e nada trava.
 *
 * O sorteio nunca repete a variante anterior, então apertar o mesmo botão duas
 * vezes seguidas dá dois efeitos diferentes.
 */

const VARIANTES = [
  "cima",
  "baixo",
  "esquerda",
  "direita",
  "circulo",
  "zoom",
  "persianas",
] as const;

type Variante = (typeof VARIANTES)[number];

const DURACAO_MS = 950;

export function TransicaoDePagina() {
  const caminho = usePathname();
  const [variante, setVariante] = useState<Variante | null>(null);
  const ultima = useRef<Variante | null>(null);
  const primeiraCarga = useRef(true);

  useEffect(() => {
    // Na primeira carga quem cuida da entrada é a Abertura, com a marca.
    // Rodar as duas juntas seria uma cortina em cima da outra.
    if (primeiraCarga.current) {
      primeiraCarga.current = false;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Sorteia entre as variantes, tirando a que acabou de rodar.
    const opcoes = VARIANTES.filter((v) => v !== ultima.current);
    const escolhida = opcoes[Math.floor(Math.random() * opcoes.length)];
    ultima.current = escolhida;
    setVariante(escolhida);

    const id = setTimeout(() => setVariante(null), DURACAO_MS);
    return () => clearTimeout(id);
  }, [caminho]);

  if (!variante) return null;

  return (
    <div
      // key força um nó novo a cada navegação, senão o React reaproveita o
      // anterior e a animação não recomeça.
      key={caminho}
      className={`transicao transicao-${variante}`}
      aria-hidden="true"
    >
      {variante === "persianas" &&
        Array.from({ length: 5 }, (_, i) => <span key={i} />)}
    </div>
  );
}
