import { prisma } from "@/lib/prisma";
import { Titulo } from "../componentes";
import { PainelDestaques } from "./painel";

export default async function AdminDestaques() {
  const [destaques, produtos] = await Promise.all([
    prisma.highlight.findMany({
      orderBy: { order: "asc" },
      include: { product: { include: { media: true } } },
    }),
    prisma.product.findMany({
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
      include: { category: true },
    }),
  ]);

  return (
    <>
      <Titulo apoio="O que aparece girando no topo da página inicial. A ordem daqui é a ordem em que eles passam.">
        Destaques
      </Titulo>

      <PainelDestaques
        destaques={destaques.map((d) => ({
          id: d.id,
          produtoId: d.productId,
          nome: d.product?.name ?? "(item apagado)",
          imagem: d.product?.media?.url ?? null,
          ativo: d.active,
          disponivel: d.product?.available ?? false,
        }))}
        produtos={produtos.map((p) => ({
          valor: p.id,
          rotulo: `${p.category.name} · ${p.name}`,
        }))}
      />
    </>
  );
}
