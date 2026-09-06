import Image from "next/image";
import { buscarCardapio, buscarRodape } from "@/lib/consultas";
import { formatarPreco, type ProdutoView } from "@/lib/formato";
import { Cabecalho, Rodape } from "@/components/estrutura";
import { Revela } from "@/components/cliente";
import { metadadosDaPagina } from "@/lib/metadados";

export const revalidate = 3600;

export async function generateMetadata() {
  const { config } = await buscarRodape();
  return metadadosDaPagina({
    titulo: `Cardápio | ${config?.siteName ?? "Dalami Confeitaria e Cafeteria"}`,
    descricao: "Cafés, doces e o que mais sai da nossa bancada, com preço atualizado.",
  });
}

function Preco({ produto }: { produto: ProdutoView }) {
  if (produto.precoPromo !== null) {
    return (
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <s className="text-sm text-tinta-tenue">{formatarPreco(produto.preco)}</s>
        <span className="font-display text-lg font-semibold text-terracota">
          {formatarPreco(produto.precoPromo)}
        </span>
      </span>
    );
  }
  return (
    <span className="font-display text-lg font-semibold whitespace-nowrap text-cacau">
      {formatarPreco(produto.preco)}
    </span>
  );
}

function SeloDestaque() {
  return (
    <span className="rounded-full bg-oliva px-2.5 py-1 font-rotulo text-[0.55rem] uppercase tracking-[0.14em] text-creme-alto">
      Destaque
    </span>
  );
}

function SeloEsgotado() {
  return (
    <span className="rounded-full bg-tinta/12 px-2.5 py-1 font-rotulo text-[0.55rem] uppercase tracking-[0.14em] text-tinta-suave">
      Hoje não temos
    </span>
  );
}

export default async function Cardapio() {
  const [cardapio, rodape] = await Promise.all([buscarCardapio(), buscarRodape()]);
  const canal = rodape.canais[0] ?? null;
  const config = rodape.config;

  return (
    <>
      <Cabecalho canal={canal} whatsapp={rodape.whatsapp} />

      <main id="conteudo">
        <section className="px-5 pt-14 pb-10 lg:pt-20">
          <div className="mx-auto max-w-6xl">
            <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
              Cardápio
            </p>
            <h1 className="mt-3 max-w-[14ch] font-display text-[clamp(2.4rem,6.5vw,4rem)] leading-[0.98] font-semibold text-cacau">
              O que tem hoje
            </h1>

            {/* Índice das categorias, para não precisar rolar procurando. */}
            <nav aria-label="Categorias" className="mt-8 flex flex-wrap gap-2">
              {cardapio.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.slug}`}
                  className="btn rounded-full border border-cacau/20 px-5 py-2.5 text-sm text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
                >
                  {c.nome}
                </a>
              ))}
            </nav>
          </div>
        </section>

        {cardapio.map((categoria) => {
          // Cada categoria escolhe o próprio layout pela presença de foto.
          // Misturar card com foto e card sem foto na mesma grade deixa a
          // seção com cara de buraco.
          const temFoto = categoria.produtos.some((p) => p.imagem !== null);

          return (
            <section
              key={categoria.id}
              id={categoria.slug}
              className="scroll-mt-24 px-5 py-10 lg:py-14"
            >
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-tinta/12 pb-5">
                  <div>
                    <h2 className="font-display text-[clamp(1.6rem,3.6vw,2.3rem)] font-semibold text-cacau">
                      {categoria.nome}
                    </h2>
                    {categoria.descricao && (
                      <p className="mt-1.5 text-tinta-suave">{categoria.descricao}</p>
                    )}
                  </div>
                  <span className="font-rotulo text-[0.6rem] uppercase tracking-[0.2em] text-tinta-tenue">
                    {categoria.produtos.length}{" "}
                    {categoria.produtos.length === 1 ? "item" : "itens"}
                  </span>
                </div>

                {temFoto ? (
                  <Revela as="ul" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoria.produtos.map((p) => (
                      <li
                        key={p.id}
                        id={p.slug}
                        className={`group scroll-mt-24 overflow-hidden rounded-[1.4rem] border border-tinta/10 bg-creme-alto transition-all hover:border-dourado/45 hover:shadow-lg hover:shadow-cacau/5 ${
                          p.disponivel ? "" : "opacity-60"
                        }`}
                      >
                        {p.imagem && (
                          <div className="relative aspect-4/3 overflow-hidden bg-creme">
                            <Image
                              src={p.imagem.url}
                              alt={p.imagem.alt}
                              fill
                              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                            <div className="absolute top-3 left-3 flex gap-2">
                              {p.destaque && p.disponivel && <SeloDestaque />}
                              {!p.disponivel && <SeloEsgotado />}
                            </div>
                          </div>
                        )}

                        <div className="flex items-start justify-between gap-4 p-5">
                          <div className="min-w-0">
                            <h3 className="font-display text-lg font-semibold text-cacau">
                              {p.nome}
                            </h3>
                            {p.descricao && (
                              <p className="mt-1.5 text-sm leading-relaxed text-tinta-suave">
                                {p.descricao}
                              </p>
                            )}
                          </div>
                          <Preco produto={p} />
                        </div>
                      </li>
                    ))}
                  </Revela>
                ) : (
                  <Revela as="ul" className="mt-6 grid gap-x-14 md:grid-cols-2">
                    {categoria.produtos.map((p) => (
                      <li
                        key={p.id}
                        id={p.slug}
                        className={`flex scroll-mt-24 items-baseline gap-4 border-b border-tinta/8 py-4 ${
                          p.disponivel ? "" : "opacity-60"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-lg font-semibold text-cacau">
                              {p.nome}
                            </h3>
                            {p.destaque && p.disponivel && <SeloDestaque />}
                            {!p.disponivel && <SeloEsgotado />}
                          </div>
                          {p.descricao && (
                            <p className="mt-1 text-sm leading-relaxed text-tinta-suave">
                              {p.descricao}
                            </p>
                          )}
                        </div>

                        {/* Linha pontilhada de cardápio, ligando nome e preço. */}
                        <span
                          aria-hidden="true"
                          className="mx-1 hidden h-px min-w-6 flex-1 self-end border-b border-dotted border-tinta/25 sm:block"
                        />
                        <Preco produto={p} />
                      </li>
                    ))}
                  </Revela>
                )}
              </div>
            </section>
          );
        })}

        {/* Sem chamada de compra no fim: o botão "Comprar no iFood" já fica
            fixo no topo, visível o tempo todo enquanto a pessoa rola o
            cardápio. Um bloco gigante repetindo a mesma ação era só peso. */}
      </main>

      <Rodape footerText={config?.footerText ?? null} />
    </>
  );
}
