import Image from "next/image";
import Link from "next/link";
import {
  buscarBlocosSobre,
  buscarCardapio,
  buscarDestaques,
  buscarEncomenda,
  buscarRodape,
  buscarSecoes,
} from "@/lib/consultas";
import { Destaques } from "@/components/destaques";
import {
  GradeHorarios,
  PausaEmAbaEscondida,
  Revela,
  StatusHorario,
} from "@/components/cliente";
import { Cabecalho, Rodape } from "@/components/estrutura";

export default async function Home() {
  const [secoes, destaques, blocosSobre, encomenda, cardapio, rodape] = await Promise.all([
    buscarSecoes(),
    buscarDestaques(),
    buscarBlocosSobre(),
    buscarEncomenda(),
    buscarCardapio(),
    buscarRodape(),
  ]);

  const canal = rodape.canais[0] ?? null;
  const config = rodape.config;

  // Cada seção da home é uma peça fechada. O admin liga, desliga e reordena
  // pela tabela SiteSection, mas o layout interno de cada uma é fixo aqui,
  // então não existe caminho para quebrar a página pelo painel.
  const pecas: Record<string, React.ReactNode> = {
    highlights: destaques.length > 0 ? <Destaques key="highlights" destaques={destaques} /> : null,

    // --- Chamada para o cardápio ---------------------------------------------
    "menu-cta": (
      <section key="menu-cta" id="cardapio-cta" className="scroll-mt-24 px-5 py-16 lg:py-24">
        <Revela className="mx-auto max-w-6xl">
          <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
            Cardápio
          </p>
          <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] font-semibold text-cacau">
            Café, doce e salgado no mesmo balcão
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cardapio.map((c) => (
              <Link
                key={c.id}
                href={`/cardapio#${c.slug}`}
                className="group flex flex-col justify-between rounded-[1.25rem] border border-tinta/10 bg-creme-alto p-6 transition-all hover:-translate-y-1 hover:border-dourado/50 hover:shadow-lg hover:shadow-cacau/5"
              >
                <div>
                  <h3 className="font-display text-xl font-semibold text-cacau">{c.nome}</h3>
                  {c.descricao && (
                    <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{c.descricao}</p>
                  )}
                </div>
                <p className="mt-6 font-rotulo text-[0.62rem] uppercase tracking-[0.2em] text-terracota">
                  {c.produtos.length} {c.produtos.length === 1 ? "item" : "itens"}
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </p>
              </Link>
            ))}
          </div>

          <Link
            href="/cardapio"
            className="btn mt-10 inline-flex rounded-full bg-oliva px-7 py-3.5 font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
          >
            Ver o cardápio completo
          </Link>
        </Revela>
      </section>
    ),

    // --- Fazer encomenda ------------------------------------------------------
    "order-cta": encomenda ? (
      <section key="order-cta" id="encomenda" className="scroll-mt-24 px-5 py-4">
        <Revela className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-terracota px-6 py-14 text-center sm:px-14">
          <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-creme/75">
            Para uma data especial
          </p>
          <h2 className="mx-auto mt-3 max-w-[20ch] font-display text-[clamp(1.9rem,4.6vw,2.9rem)] leading-tight font-semibold text-creme-alto">
            {encomenda.titulo}
          </h2>
          {encomenda.descricao && (
            <div
              className="mx-auto mt-5 max-w-[54ch] text-[1.02rem] leading-relaxed text-creme/90"
              // Texto rico LIMITADO, sanitizado no servidor antes de salvar.
              dangerouslySetInnerHTML={{ __html: encomenda.descricao }}
            />
          )}
          {encomenda.whatsapp && (
            <a
              href={encomenda.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-9 inline-flex items-center gap-2 rounded-full bg-creme-alto px-8 py-4 font-medium text-terracota transition-transform hover:scale-[1.02]"
            >
              Falar no WhatsApp
            </a>
          )}
        </Revela>
      </section>
    ) : null,

    // --- Sobre, com blocos que alternam o lado da imagem ----------------------
    about:
      blocosSobre.length > 0 ? (
        <section key="about" id="sobre" className="scroll-mt-24 px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-6xl space-y-16 lg:space-y-24">
            {blocosSobre.map((bloco, i) => {
              // O lado sai da POSIÇÃO na lista, nunca de um campo editável.
              // Par: imagem à esquerda. Ímpar: imagem à direita.
              const imagemNaDireita = i % 2 === 1;
              return (
                <Revela
                  key={bloco.id}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
                >
                  {bloco.imagem && (
                    <div className={imagemNaDireita ? "lg:order-2" : "lg:order-1"}>
                      <div className="relative aspect-5/4 overflow-hidden rounded-[1.75rem] bg-creme">
                        <Image
                          src={bloco.imagem.url}
                          alt={bloco.imagem.alt}
                          fill
                          sizes="(max-width: 1024px) 90vw, 46vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className={imagemNaDireita ? "lg:order-1" : "lg:order-2"}>
                    {i === 0 && (
                      <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
                        Sobre a casa
                      </p>
                    )}
                    {bloco.titulo && (
                      <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.5rem)] leading-tight font-semibold text-cacau">
                        {bloco.titulo}
                      </h2>
                    )}
                    <div className="mt-5 h-px w-20 bg-dourado/60" />
                    {bloco.corpo && (
                      <div
                        className="mt-5 max-w-[54ch] space-y-4 text-[1.05rem] leading-relaxed text-tinta-suave"
                        dangerouslySetInnerHTML={{ __html: bloco.corpo }}
                      />
                    )}
                  </div>
                </Revela>
              );
            })}
          </div>
        </section>
      ) : null,

    // --- Localização ----------------------------------------------------------
    location:
      config?.locationRegion ? (
        <section key="location" id="localizacao" className="scroll-mt-24 bg-oliva px-5 py-16 text-creme-alto lg:py-20">
          <Revela className="mx-auto flex max-w-6xl flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-dourado-claro">
                Onde estamos
              </p>
              <p className="mt-4 font-display text-[clamp(1.7rem,4vw,2.6rem)] leading-tight font-semibold">
                {config.locationRegion}
              </p>
              {config.locationNote && (
                <p className="mt-3 max-w-[46ch] text-[1.05rem] text-creme/80">
                  {config.locationNote}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <StatusHorario periodos={rodape.horarios} excecoes={rodape.excecoes} claro />
            </div>
          </Revela>
        </section>
      ) : null,

    // --- Horário --------------------------------------------------------------
    hours: (
      <section key="hours" id="horario" className="scroll-mt-24 px-5 py-16 lg:py-20">
        <Revela className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[auto_1fr] lg:gap-20">
          <div>
            <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
              Horário
            </p>
            <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.4rem)] font-semibold text-cacau">
              Quando abrimos
            </h2>
            <div className="mt-5">
              <StatusHorario periodos={rodape.horarios} excecoes={rodape.excecoes} />
            </div>
          </div>
          <GradeHorarios periodos={rodape.horarios} />
        </Revela>
      </section>
    ),

    // --- Contato --------------------------------------------------------------
    contact: (
      <section key="contact" id="contato" className="scroll-mt-24 border-t border-tinta/10 px-5 py-16 lg:py-20">
        <Revela className="mx-auto max-w-6xl">
          <p className="font-rotulo text-[0.66rem] uppercase tracking-[0.32em] text-terracota">
            Contato
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,4vw,2.4rem)] font-semibold text-cacau">
            Fale com a gente
          </h2>

          <div className="mt-8 flex flex-wrap gap-3">
            {encomenda?.whatsapp && (
              <a
                href={encomenda.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn rounded-full bg-oliva px-6 py-3 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
              >
                WhatsApp
              </a>
            )}
            {canal && (
              <a
                href={canal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn rounded-full bg-terracota px-6 py-3 text-sm font-medium text-creme-alto transition-colors hover:bg-terracota-claro"
              >
                Comprar no {canal.nome}
              </a>
            )}
            {rodape.redes.map((r) => (
              <a
                key={r.url}
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn rounded-full border border-cacau/25 px-6 py-3 text-sm font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
              >
                {r.nome}
              </a>
            ))}
          </div>
        </Revela>
      </section>
    ),
  };

  return (
    <>
      <PausaEmAbaEscondida />
      <Cabecalho canal={canal} />
      <main id="conteudo">{secoes.map((chave) => pecas[chave] ?? null)}</main>
      <Rodape
        footerText={config?.footerText ?? null}
        redes={rodape.redes}
        regiao={config?.locationRegion ?? null}
      />
    </>
  );
}

export const revalidate = 3600;

export async function generateMetadata() {
  const { config } = await buscarRodape();
  return {
    title: config?.seoTitle ?? "Dalami Confeitaria e Cafeteria",
    description: config?.seoDescription ?? undefined,
    openGraph: {
      title: config?.seoTitle ?? "Dalami Confeitaria e Cafeteria",
      description: config?.seoDescription ?? undefined,
      type: "website",
      locale: "pt_BR",
    },
  };
}
