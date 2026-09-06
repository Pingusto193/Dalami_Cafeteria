import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatarPreco } from "@/lib/formato";
import { Titulo } from "../componentes";
import { Categorias } from "./categorias";
import { LinhaDoItem } from "./linha-do-item";

export default async function AdminCardapio() {
  const categorias = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      products: { orderBy: { order: "asc" }, include: { media: true } },
      _count: { select: { products: true } },
    },
  });

  return (
    <>
      <Titulo
        apoio="Aqui você cria as categorias e os itens que aparecem no cardápio do site. Tudo que salvar aparece no site na hora."
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
              <ul className="mt-4 space-y-2">
                {c.products.map((p, i) => (
                  <LinhaDoItem
                    key={p.id}
                    id={p.id}
                    nome={p.name}
                    preco={formatarPreco(Number(p.price))}
                    precoPromo={p.promoPrice !== null ? formatarPreco(Number(p.promoPrice)) : null}
                    disponivel={p.available}
                    destaque={p.featured}
                    primeiro={i === 0}
                    ultimo={i === c.products.length - 1}
                    miniatura={
                      p.media ? (
                        <Image
                          src={p.media.url}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null
                    }
                  />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
