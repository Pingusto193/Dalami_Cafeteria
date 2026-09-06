import { prisma } from "@/lib/prisma";
import { Titulo } from "../componentes";
import { PainelImagens } from "./painel";

export default async function AdminImagens() {
  const midias = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { products: true, categories: true, contentBlocks: true, highlights: true },
      },
    },
  });

  return (
    <>
      <Titulo apoio="Todas as fotos que já estão no site. Você pode enviar novas, corrigir a descrição e apagar as que não usa mais.">
        Imagens
      </Titulo>

      <PainelImagens
        imagens={midias.map((m) => ({
          id: m.id,
          url: m.url,
          alt: m.altText,
          largura: m.width,
          altura: m.height,
          peso: Math.round(m.sizeBytes / 1024),
          usos:
            m._count.products +
            m._count.categories +
            m._count.contentBlocks +
            m._count.highlights,
        }))}
      />
    </>
  );
}
