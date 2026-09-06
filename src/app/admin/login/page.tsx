import type { Metadata } from "next";
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
        <div className="text-center">
          <p className="font-display text-3xl font-semibold tracking-tight text-cacau">
            Dalami
          </p>
          <p className="mt-1.5 font-rotulo text-[0.58rem] uppercase tracking-[0.38em] text-tinta-tenue">
            Painel
          </p>
        </div>

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
