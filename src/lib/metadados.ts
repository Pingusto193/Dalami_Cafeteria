import "server-only";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

/**
 * Monta as tags de compartilhamento das páginas públicas.
 *
 * Existe num lugar só porque a parte que mais dá errado é a imagem: sem ela,
 * quem manda o link da confeitaria no WhatsApp vê uma prévia sem foto, que é
 * o pior cartão de visita possível para um negócio que vende bolo.
 *
 * A URL da imagem precisa ser ABSOLUTA. O Next resolve isso a partir do
 * `metadataBase` do layout, que sai de NEXT_PUBLIC_SITE_URL. Se essa variável
 * não estiver preenchida em produção, a prévia sai quebrada mesmo com a foto
 * escolhida no painel.
 */
export async function metadadosDaPagina({
  titulo,
  descricao,
}: {
  titulo?: string;
  descricao?: string;
} = {}): Promise<Metadata> {
  const config = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { seoImageMedia: true, faviconMedia: true },
  });

  const nome = config?.siteName ?? "Dalami Confeitaria e Cafeteria";
  const t = titulo ?? config?.seoTitle ?? nome;
  const d =
    descricao ??
    config?.seoDescription ??
    "Confeitaria e cafeteria no bairro Ingleses, em Florianópolis.";

  const foto = config?.seoImageMedia;

  return {
    title: t,
    description: d,
    openGraph: {
      title: t,
      description: d,
      siteName: nome,
      type: "website",
      locale: "pt_BR",
      images: foto
        ? [
            {
              url: foto.url,
              width: foto.width,
              height: foto.height,
              alt: foto.altText,
            },
          ]
        : undefined,
    },
    twitter: {
      card: foto ? "summary_large_image" : "summary",
      title: t,
      description: d,
      images: foto ? [foto.url] : undefined,
    },
    icons: config?.faviconMedia ? { icon: config.faviconMedia.url } : undefined,
  };
}
