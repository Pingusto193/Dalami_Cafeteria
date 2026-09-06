import { prisma } from "@/lib/prisma";
import { paraTextoSimples } from "@/lib/admin";
import { imagensDisponiveis } from "@/lib/midias";
import { Titulo } from "../componentes";
import { PainelSobre } from "./painel";

export default async function AdminSobre() {
  const [blocos, imagens] = await Promise.all([
    prisma.contentBlock.findMany({ orderBy: { order: "asc" }, include: { media: true } }),
    imagensDisponiveis(),
  ]);

  return (
    <>
      <Titulo apoio="Os blocos de texto e foto que contam a história da casa. O lado da foto alterna sozinho: o primeiro bloco fica com a foto à esquerda, o segundo à direita, e assim por diante.">
        Sobre
      </Titulo>

      <PainelSobre
        blocos={blocos.map((b) => ({
          id: b.id,
          titulo: b.title ?? "",
          corpo: paraTextoSimples(b.body),
          visivel: b.visible,
          imagem: b.media
            ? { id: b.media.id, url: b.media.url, alt: b.media.altText }
            : null,
        }))}
        imagens={imagens}
      />
    </>
  );
}
