import { prisma } from "@/lib/prisma";
import { paraTextoSimples } from "@/lib/admin";
import { formatarPreco } from "@/lib/formato";
import { Titulo } from "../componentes";
import { PainelEncomenda } from "./painel";

export default async function AdminEncomenda() {
  const [secao, itens, produtos] = await Promise.all([
    prisma.orderSection.findUnique({ where: { id: "singleton" } }),
    prisma.orderSectionItem.findMany({
      orderBy: { order: "asc" },
      include: { product: { include: { media: true, category: true } } },
    }),
    prisma.product.findMany({
      orderBy: [{ categoryId: "asc" }, { order: "asc" }],
      include: { category: true },
    }),
  ]);

  const jaNaLista = new Set(itens.map((i) => i.productId));

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
          nome: i.product.name,
          categoria: i.product.category.name,
          preco: formatarPreco(Number(i.product.price)),
          imagem: i.product.media?.url ?? null,
          disponivel: i.product.available,
        }))}
        disponiveis={produtos
          .filter((p) => !jaNaLista.has(p.id))
          .map((p) => ({ valor: p.id, rotulo: `${p.category.name} · ${p.name}` }))}
      />
    </>
  );
}
