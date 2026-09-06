import type { Metadata, Viewport } from "next";
import { Fraunces, Karla, JetBrains_Mono } from "next/font/google";
import { TransicaoDePagina } from "@/components/transicoes";
import "./globals.css";

// Display com personalidade real. Fraunces tem eixo óptico e um leve desalinho
// nas serifas que combina com confeitaria artesanal, e cobre todo o português.
// Sem `weight`: a fonte entra como variável, o que libera os eixos SOFT e WONK
// e ainda dá toda a faixa de peso num arquivo só.
const display = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--fonte-display",
  display: "swap",
});

// Texto quieto. Karla tem calor sem chamar atenção para si.
const texto = Karla({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--fonte-texto",
  display: "swap",
});

// Mono só para rótulos pequenos em caixa alta.
const rotulo = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--fonte-rotulo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dalami Confeitaria e Cafeteria",
  description:
    "Bolos artesanais feitos por encomenda no bairro Ingleses, em Florianópolis. A vida merece ser saboreada.",
  // DEPLOY STEP: og:image e og:url exigem URL absoluta, que só existe depois
  // da publicação. Preencher NEXT_PUBLIC_SITE_URL antes do deploy.
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
};

export const viewport: Viewport = {
  themeColor: "#485329",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${texto.variable} ${rotulo.variable}`}>
      <body>
        <div className="ambiente" aria-hidden="true" />

        {/* A abertura da marca fica no Cabecalho, que só as páginas públicas
            usam. No painel ela seria só atraso entre uma tela e outra. */}
        <TransicaoDePagina />

        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:bg-oliva focus:px-5 focus:py-3 focus:text-creme-alto"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
