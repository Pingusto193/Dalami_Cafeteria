import Image from "next/image";
import { notFound } from "next/navigation";
import { buscarEncomenda, buscarRodape } from "@/lib/consultas";
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

            {/* O único botão da página. Tudo aqui termina na mesma conversa
                de WhatsApp, então repetir a ação em cada card só polui. */}
            {encomenda.whatsapp && (
              <a
                href={encomenda.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn mt-9 inline-flex items-center gap-2.5 rounded-full bg-oliva px-9 py-4.5 text-[1.05rem] font-medium text-creme-alto transition-all hover:bg-oliva-escuro hover:shadow-lg hover:shadow-oliva/25"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.11-.22-.17-.47-.29Z" />
                </svg>
                Encomendar pelo WhatsApp
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

                      {/* Sem botão por item de propósito: todos levariam para
                          o mesmo WhatsApp. Um botão só, grande, no topo da
                          página. O card aqui é vitrine, não ponto de decisão. */}
                      <div className="mt-5 flex items-baseline gap-2 pt-1">
                        {item.precoPromo !== null && (
                          <s className="text-sm text-tinta-tenue">{formatarPreco(item.preco)}</s>
                        )}
                        <span
                          className={`font-display text-lg font-semibold ${
                            item.precoPromo !== null ? "text-terracota" : "text-cacau"
                          }`}
                        >
                          {formatarPreco(item.precoPromo ?? item.preco)}
                        </span>
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
