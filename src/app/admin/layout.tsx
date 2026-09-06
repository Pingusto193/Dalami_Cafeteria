import type { Metadata } from "next";
import Link from "next/link";
import { estaLogado } from "@/lib/auth";
import { sair } from "./acoes";
import { BotaoInicio } from "./voltar";

export const metadata: Metadata = {
  title: "Painel | Dalami",
  robots: { index: false, follow: false },
};

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  // A página de login usa este mesmo layout, mas sem menu: quem não entrou
  // ainda não tem para onde navegar.
  if (!(await estaLogado())) return <>{children}</>;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-tinta/10 bg-creme-fundo/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5">
          <Link href="/admin" className="leading-none">
            <span className="block font-display text-xl font-semibold tracking-tight text-cacau">
              Dalami
            </span>
            <span className="mt-0.5 block font-rotulo text-[0.55rem] uppercase tracking-[0.32em] text-tinta-tenue">
              Painel
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <BotaoInicio />
            <Link
              href="/"
              target="_blank"
              className="btn rounded-full border border-cacau/20 px-4 py-2 text-xs font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
            >
              Ver o site
            </Link>
            <form action={sair}>
              <button
                type="submit"
                className="btn rounded-full px-4 py-2 text-xs text-tinta-suave transition-colors hover:text-terracota"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10">{children}</main>
    </div>
  );
}
