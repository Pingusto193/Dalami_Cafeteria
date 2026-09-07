import type { Metadata } from "next";
import Link from "next/link";
import { FormularioLogin } from "./formulario";

export const metadata: Metadata = {
  title: "Entrar no painel",
  // O painel nunca deve aparecer em busca.
  robots: { index: false, follow: false },
};

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ voltar?: string }>;
}) {
  const { voltar } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        {/* Quem cai aqui sem querer (ou desiste no meio do login) precisa de
            um jeito de voltar sem ter que usar o botão "voltar" do navegador,
            que a pessoa nem sempre pensa em usar. A logo vira esse caminho de
            volta, com uma seta para deixar claro que é clicável, e não só
            decoração. */}
        <Link
          href="/"
          className="btn group block text-center transition-opacity hover:opacity-80"
        >
          <p className="font-display text-3xl font-semibold tracking-tight text-cacau">
            Dalami
          </p>
          <p className="mt-1.5 font-rotulo text-[0.58rem] uppercase tracking-[0.38em] text-tinta-tenue">
            Painel
          </p>
          <p className="mt-3 flex items-center justify-center gap-1 text-xs text-tinta-tenue">
            <svg viewBox="0 0 24 24" className="size-3 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Voltar para o site
          </p>
        </Link>

        <div className="mt-9 rounded-[1.5rem] border border-tinta/10 bg-creme-alto p-7">
          <FormularioLogin voltar={voltar} />
        </div>

        <p className="mt-6 text-center text-xs text-tinta-tenue">
          Esqueceu a senha? Ela fica no arquivo de configuração do site.
        </p>
      </div>
    </main>
  );
}
