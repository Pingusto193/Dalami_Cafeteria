import Link from "next/link";
import { FitaDourada } from "@/components/cliente";

type Canal = { nome: string; url: string; tipo: string } | null;
type Rede = { nome: string; url: string };

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

export function Cabecalho({ canal }: { canal: Canal }) {
  return (
    <header className="sticky top-0 z-40 border-b border-tinta/8 bg-creme-fundo/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Link href="/" aria-label="Dalami Confeitaria e Cafeteria, ir para a página inicial">
          <Marca />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="/cardapio">
            Cardápio
          </Link>
          <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="/#encomenda">
            Encomenda
          </Link>
          <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="/#sobre">
            Sobre
          </Link>
          <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="/#contato">
            Contato
          </Link>
        </nav>

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

export function Rodape({
  footerText,
  redes,
  regiao,
}: {
  footerText: string | null;
  redes: Rede[];
  regiao: string | null;
}) {
  return (
    <footer className="bg-cacau text-creme/70">
      <div className="mx-auto max-w-6xl px-5 py-12">
        {/* A fita dourada, o elemento assinatura do site: toda encomenda da
            casa sai com uma fita amarrada, então ela costura as seções. */}
        <FitaDourada className="mb-10 h-8 w-full opacity-60" />

        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Marca claro />
            {footerText && (
              <p className="mt-5 font-display text-lg text-dourado-claro">{footerText}</p>
            )}
            {regiao && <p className="mt-2 text-sm text-creme/50">{regiao}</p>}
          </div>

          <nav aria-label="Rodapé" className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <Link className="transition-colors hover:text-creme-alto" href="/cardapio">
              Cardápio
            </Link>
            <Link className="transition-colors hover:text-creme-alto" href="/#encomenda">
              Encomenda
            </Link>
            <Link className="transition-colors hover:text-creme-alto" href="/#sobre">
              Sobre
            </Link>
            <Link className="transition-colors hover:text-creme-alto" href="/#horario">
              Horário
            </Link>
            {redes.map((r) => (
              <a
                key={r.url}
                className="transition-colors hover:text-creme-alto"
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {r.nome}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-10 border-t border-creme/10 pt-6 text-xs text-creme/40">
          © {new Date().getFullYear()} Dalami Confeitaria e Cafeteria.
        </p>
      </div>
    </footer>
  );
}
