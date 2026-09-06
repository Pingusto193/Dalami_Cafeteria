import Link from "next/link";
import { FitaDourada } from "@/components/cliente";

type Canal = { nome: string; url: string; tipo: string } | null;

/**
 * Marca em texto, no lugar do logo.
 *
 * O logo real da Dalami é uma assinatura cursiva dourada com "CONFEITARIA" em
 * caixa alta abaixo. Até o arquivo em alta chegar, isto ocupa a mesma
 * proporção de uma wordmark horizontal, para a troca não mexer no layout.
 */
export function Marca({ claro = false }: { claro?: boolean }) {
  return (
    <span className="block leading-none">
      <span
        className={`block font-display text-2xl font-semibold tracking-tight ${
          claro ? "text-creme-alto" : "text-cacau"
        }`}
      >
        Dalami
      </span>
      <span
        className={`mt-1 block font-rotulo text-[0.58rem] uppercase tracking-[0.38em] ${
          claro ? "text-creme/50" : "text-tinta-tenue"
        }`}
      >
        Confeitaria
      </span>
    </span>
  );
}

/**
 * Cabeçalho enxuto: a marca e uma única ação.
 *
 * Sem menu de navegação de propósito. A home já leva para cardápio e encomenda
 * nas próprias seções, e um menu repetindo isso no topo só divide a atenção.
 */
export function Cabecalho({ canal }: { canal: Canal }) {
  return (
    <header className="sticky top-0 z-40 border-b border-tinta/8 bg-creme-fundo/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" aria-label="Dalami Confeitaria e Cafeteria, ir para a página inicial">
          <Marca />
        </Link>

        {canal ? (
          <a
            href={canal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn shrink-0 rounded-full bg-oliva px-5 py-2.5 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
          >
            Comprar no {canal.nome}
          </a>
        ) : (
          <Link
            href="/cardapio"
            className="btn shrink-0 rounded-full bg-oliva px-5 py-2.5 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
          >
            Ver cardápio
          </Link>
        )}
      </div>
    </header>
  );
}

/**
 * Rodapé enxuto: a marca e a assinatura, que o dono edita pelo painel.
 *
 * Sem menu e sem repetir o endereço. A seção de Localização na home já diz
 * onde a loja fica, e repetir a mesma informação duas vezes na mesma rolagem
 * não ajuda ninguém.
 */
export function Rodape({ footerText }: { footerText: string | null }) {
  return (
    <footer className="bg-cacau text-creme/70">
      <div className="mx-auto max-w-6xl px-5 py-12">
        {/* A fita dourada, o elemento assinatura do site: toda encomenda da
            casa sai com uma fita amarrada, então ela fecha a página. */}
        <FitaDourada className="mb-10 h-8 w-full opacity-60" />

        <Marca claro />

        {footerText && (
          <p className="mt-5 font-display text-lg text-dourado-claro">{footerText}</p>
        )}

        <p className="mt-10 border-t border-creme/10 pt-6 text-xs text-creme/40">
          © {new Date().getFullYear()} Dalami Confeitaria e Cafeteria.
        </p>
      </div>
    </footer>
  );
}
