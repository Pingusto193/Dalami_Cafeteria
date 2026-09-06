import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { imagensDisponiveis } from "@/lib/midias";
import { Titulo } from "../../componentes";
import { FormularioItem } from "../formulario-item";

/** Mostra o preço no formato que o dono digita: vírgula nos centavos. */
function paraCampo(valor: unknown): string {
  return Number(valor).toFixed(2).replace(".", ",");
}

export default async function EditarItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [item, categorias, imagens] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { media: true } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    imagensDisponiveis(),
  ]);

  if (!item) notFound();

  return (
    <>
      <Titulo apoio="As mudanças aparecem no site assim que você salvar.">
        {item.name}
      </Titulo>
      <FormularioItem
        item={{
          id: item.id,
          nome: item.name,
          descricao: item.description,
          preco: paraCampo(item.price),
          precoPromo: item.promoPrice !== null ? paraCampo(item.promoPrice) : null,
          categoriaId: item.categoryId,
          destaque: item.featured,
          disponivel: item.available,
          imagem: item.media
            ? { id: item.media.id, url: item.media.url, alt: item.media.altText }
            : null,
        }}
        categorias={categorias.map((c) => ({ valor: c.id, rotulo: c.name }))}
        imagens={imagens}
      />
    </>
  );
}
