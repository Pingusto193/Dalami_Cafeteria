import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatarPreco } from "@/lib/formato";
import { Titulo } from "../componentes";
import { Categorias } from "./categorias";
import { ListaDeItens } from "./lista-de-itens";

export default async function AdminCardapio() {
  const categorias = await prisma.category.findMany({
    // A categoria das encomendas fica de fora daqui de propósito: ela tem uma
    // tela só dela, e mostrar o mesmo conteúdo em dois lugares faz a pessoa
    // se perguntar em qual dos dois deve mexer.
    where: { slug: { not: "encomendas" } },
    orderBy: { order: "asc" },
    include: {
      products: { orderBy: { order: "asc" }, include: { media: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <>
      <Titulo
        apoio="Aqui você cria as categorias e os itens que aparecem no cardápio do site. O interruptor de cada item liga e desliga o 'Tem hoje': desligue quando acabar, e o item aparece no site marcado como esgotado. Tudo que salvar aparece no site na hora."
        acao={
          <Link
            href="/admin/cardapio/novo"
            className="btn rounded-full bg-oliva px-6 py-2.5 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
          >
            Novo item
          </Link>
        }
      >
        Cardápio
      </Titulo>

      <Categorias
        categorias={categorias.map((c) => ({
          id: c.id,
          nome: c.name,
          descricao: c.description,
          ativa: c.active,
          quantosItens: c._count.products,
        }))}
      />

      <div className="mt-12 space-y-10">
        {categorias.map((c) => (
          <section key={c.id}>
            <h2 className="flex items-center gap-3 border-b border-tinta/12 pb-3 font-display text-xl font-semibold text-cacau">
              {c.name}
              {!c.active && (
                <span className="rounded-full bg-tinta/10 px-2.5 py-1 font-rotulo text-[0.5rem] uppercase tracking-wider text-tinta-suave">
                  Escondida do site
                </span>
              )}
            </h2>

            {c.products.length === 0 ? (
              <p className="mt-4 text-sm text-tinta-tenue">
                Nenhum item aqui ainda.{" "}
                <Link href="/admin/cardapio/novo" className="text-terracota underline">
                  Criar o primeiro
                </Link>
                .
              </p>
            ) : (
              <div className="mt-4">
                <ListaDeItens
                  itens={c.products.map((p) => ({
                    id: p.id,
                    nome: p.name,
                    preco: formatarPreco(Number(p.price)),
                    precoPromo:
                      p.promoPrice !== null ? formatarPreco(Number(p.promoPrice)) : null,
                    disponivel: p.available,
                    destaque: p.featured,
                    imagemUrl: p.media?.url ?? null,
                  }))}
                />
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
