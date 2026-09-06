import { prisma } from "@/lib/prisma";
import { paraTextoSimples } from "@/lib/admin";
import { imagensDisponiveis } from "@/lib/midias";
import { Titulo } from "../componentes";
import { PainelEncomenda } from "./painel";

/** Mostra o preço no formato que o dono digita: vírgula nos centavos. */
function paraCampo(valor: unknown): string {
  return Number(valor).toFixed(2).replace(".", ",");
}

export default async function AdminEncomenda() {
  const [secao, itens, imagens] = await Promise.all([
    prisma.orderSection.findUnique({ where: { id: "singleton" } }),
    prisma.orderSectionItem.findMany({
      orderBy: { order: "asc" },
      include: { product: { include: { media: true } } },
    }),
    imagensDisponiveis(),
  ]);

  return (
    <>
      <Titulo apoio="A página de encomenda tem um cardápio próprio, separado do cardápio do dia a dia. Bolo inteiro e bandeja de docinho ficam aqui.">
        Encomenda
      </Titulo>

      <PainelEncomenda
        secao={{
          titulo: secao?.title ?? "Fazer encomenda",
          descricao: paraTextoSimples(secao?.description ?? null),
          whatsapp: secao?.whatsappNumber ?? "",
          ativa: secao?.active ?? true,
        }}
        itens={itens.map((i) => ({
          id: i.id,
          produtoId: i.productId,
          nome: i.product.name,
          descricao: i.product.description ?? "",
          preco: paraCampo(i.product.price),
          imagem: i.product.media
            ? {
                id: i.product.media.id,
                url: i.product.media.url,
                alt: i.product.media.altText,
              }
            : null,
        }))}
        imagens={imagens}
      />
    </>
  );
}
