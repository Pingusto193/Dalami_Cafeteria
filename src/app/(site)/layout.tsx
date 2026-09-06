/**
 * Layout das páginas públicas.
 *
 * Existe por causa da abertura da marca. Ela morava no cabeçalho, que é
 * remontado a cada página, então a animação da Dalami rodava de novo toda vez
 * que a pessoa clicava para ir ao cardápio ou à encomenda. Charme na primeira
 * vez, atraso da segunda em diante.
 *
 * Aqui ela roda uma vez só: o Next mantém este layout montado enquanto a
 * navegação acontece dentro das páginas públicas, então o elemento não é
 * recriado e a animação não recomeça. Ao entrar no site de novo, com recarga
 * de verdade, ela volta.
 *
 * O painel tem layout próprio e não passa por aqui, então nunca vê a abertura.
 */
export default function LayoutDoSite({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* CSS puro e servido no HTML: já está pintada no primeiro quadro, sem
          piscar o conteúdo antes. */}
      <div className="abertura" aria-hidden="true">
        <div className="abertura-conteudo text-center">
          <p className="abertura-nome font-display text-[clamp(2.6rem,9vw,4.5rem)] leading-none font-semibold tracking-tight text-cacau">
            Dalami
          </p>
          <div className="abertura-fita mx-auto mt-5 h-px w-32 bg-dourado" />
          <p className="abertura-tipo mt-5 font-rotulo text-[0.6rem] uppercase tracking-[0.42em] text-tinta-tenue">
            Confeitaria e Cafeteria
          </p>
        </div>
      </div>

      {children}
    </>
  );
}
