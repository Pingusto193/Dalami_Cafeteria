import Image from "next/image";
import { notFound } from "next/navigation";
import { buscarEncomenda, buscarRodape, linkEncomenda } from "@/lib/consultas";
import { formatarPreco } from "@/lib/formato";
import { Cabecalho, Rodape } from "@/components/estrutura";
import { Revela } from "@/components/cliente";

export const revalidate = 3600;

export async function generateMetadata() {
  const { config } = await buscarRodape();
  const titulo = `Encomendas | ${config?.siteName ?? "Dalami Confeitaria e Cafeteria"}`;
  return {
    title: titulo,
    description:
      "Bolos inteiros e bandejas de docinho feitos sob encomenda na Dalami Confeitaria e Cafeteria.",
    openGraph: { title: titulo, type: "website", locale: "pt_BR" },
  };
}

export default async function Encomenda() {
  const [encomenda, rodape] = await Promise.all([buscarEncomenda(), buscarRodape()]);

  // Se o admin desligar a seção de encomenda, a página some junto.
  if (!encomenda) notFound();

  const canal = rodape.canais[0] ?? null;
  const config = rodape.config;

  return (
    <>
      <Cabecalho canal={canal} />

      <main id="conteudo">
        <section className="px-5 pt-14 pb-12 lg:pt-20">
          <div className="mx-auto max-w-6xl">
            <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
              Sob encomenda
            </p>
            <h1 className="mt-3 max-w-[16ch] font-display text-[clamp(2.4rem,6.5vw,4rem)] leading-[0.98] font-semibold text-cacau">
              {encomenda.titulo}
            </h1>

            {encomenda.descricao && (
              <div
                className="mt-6 max-w-[56ch] text-[1.08rem] leading-relaxed text-tinta-suave"
                // Texto rico LIMITADO, sanitizado no servidor antes de salvar.
                dangerouslySetInnerHTML={{ __html: encomenda.descricao }}
              />
            )}

            {encomenda.whatsapp && (
              <a
                href={encomenda.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn mt-8 inline-flex rounded-full bg-oliva px-7 py-3.5 font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
              >
                Falar no WhatsApp
              </a>
            )}
          </div>
        </section>

        {encomenda.itens.length > 0 ? (
          <section className="px-5 pb-16">
            <div className="mx-auto max-w-6xl">
              <h2 className="border-b border-tinta/12 pb-5 font-display text-[clamp(1.5rem,3.4vw,2.1rem)] font-semibold text-cacau">
                O que fazemos por encomenda
              </h2>

              <Revela as="ul" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {encomenda.itens.map((item) => (
                  <li
                    key={item.id}
                    id={item.slug}
                    className="group flex scroll-mt-24 flex-col overflow-hidden rounded-[1.4rem] border border-tinta/10 bg-creme-alto transition-all hover:border-dourado/45 hover:shadow-lg hover:shadow-cacau/5"
                  >
                    {item.imagem && (
                      <div className="relative aspect-4/3 overflow-hidden bg-creme">
                        <Image
                          src={item.imagem.url}
                          alt={item.imagem.alt}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold text-cacau">
                        {item.nome}
                      </h3>
                      {item.descricao && (
                        <p className="mt-1.5 text-sm leading-relaxed text-tinta-suave">
                          {item.descricao}
                        </p>
                      )}

                      <div className="mt-5 flex items-end justify-between gap-3 pt-1">
                        <span className="flex items-baseline gap-2">
                          {item.precoPromo !== null && (
                            <s className="text-sm text-tinta-tenue">
                              {formatarPreco(item.preco)}
                            </s>
                          )}
                          <span
                            className={`font-display text-lg font-semibold ${
                              item.precoPromo !== null ? "text-terracota" : "text-cacau"
                            }`}
                          >
                            {formatarPreco(item.precoPromo ?? item.preco)}
                          </span>
                        </span>

                        {encomenda.whatsapp && (
                          <a
                            // O nome do item já vai escrito na mensagem, para o
                            // dono não precisar perguntar o que a pessoa quer.
                            href={linkEncomenda(encomenda.whatsapp, item.nome)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn shrink-0 rounded-full bg-oliva px-4 py-2 text-xs font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
                          >
                            Encomendar
                          </a>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </Revela>
            </div>
          </section>
        ) : (
          <section className="px-5 pb-16">
            <p className="mx-auto max-w-6xl text-tinta-suave">
              O cardápio de encomenda está sendo montado. Fale com a gente no WhatsApp.
            </p>
          </section>
        )}
      </main>

      <Rodape footerText={config?.footerText ?? null} />
    </>
  );
}
