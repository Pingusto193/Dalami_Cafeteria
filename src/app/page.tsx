import Image from "next/image";
import Link from "next/link";
import {
  buscarCardapio,
  buscarConteudo,
  buscarDestaques,
  buscarRodape,
  formatarPreco,
} from "@/lib/consultas";
import {
  FitaDourada,
  GradeHorarios,
  PausaEmAbaEscondida,
  Revela,
  StatusHorario,
} from "@/components/cliente";

export default async function Home() {
  const [destaques, sobre, cardapio, rodape] = await Promise.all([
    buscarDestaques(),
    buscarConteudo("sobre"),
    buscarCardapio(),
    buscarRodape(),
  ]);

  const canalPadrao = rodape.canais[0] ?? null;
  const instagram = rodape.redes.find((r) => r.nome === "Instagram");
  const heroImagem = sobre?.imagem ?? destaques[0]?.imagem ?? null;

  return (
    <>
      <PausaEmAbaEscondida />

      {/* ================= CABEÇALHO ================= */}
      <header className="sticky top-0 z-40 border-b border-tinta/8 bg-creme-fundo/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
          <Link href="/" className="group leading-none">
            <span className="block font-display text-2xl font-semibold tracking-tight text-cacau">
              Dalami
            </span>
            <span className="mt-0.5 block font-rotulo text-[0.6rem] uppercase tracking-[0.38em] text-tinta-tenue">
              Confeitaria
            </span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
            <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="#mais-pedidos">
              Mais pedidos
            </Link>
            <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="#sobre">
              Sobre
            </Link>
            <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="/cardapio">
              Cardápio
            </Link>
            <Link className="text-sm text-tinta-suave transition-colors hover:text-cacau" href="#contato">
              Contato
            </Link>
          </nav>

          {canalPadrao && (
            <a
              href={canalPadrao.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn rounded-full bg-oliva px-5 py-2.5 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
            >
              Encomendar
            </a>
          )}
        </div>
      </header>

      <main id="conteudo">
        {/* ================= HERO ================= */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pt-14 pb-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-20 lg:pb-24">
            <Revela className="max-w-[34rem]">
              <p className="font-rotulo text-[0.68rem] uppercase tracking-[0.32em] text-terracota">
                Ingleses, Florianópolis
              </p>

              <h1 className="mt-5 font-display text-[clamp(2.6rem,7vw,4.6rem)] leading-[0.95] font-semibold tracking-tight text-cacau uppercase">
                A vida
                <br />
                merece ser
                <br />
                <span className="text-oliva">saboreada.</span>
              </h1>

              <div className="mt-7 h-px w-24 bg-dourado/60" />

              <p className="mt-6 max-w-[46ch] text-[1.05rem] leading-relaxed text-tinta-suave">
                Bolos artesanais feitos por encomenda, montados no dia da retirada.
                Você escolhe o sabor e o tamanho, a gente cuida do resto.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                {canalPadrao && (
                  <a
                    href={canalPadrao.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn rounded-full bg-oliva px-7 py-3.5 font-medium text-creme-alto transition-all hover:bg-oliva-escuro hover:shadow-lg hover:shadow-oliva/20"
                  >
                    Encomendar pelo {canalPadrao.nome}
                  </a>
                )}
                <Link
                  href="/cardapio"
                  className="btn rounded-full border border-cacau/25 px-7 py-3.5 font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
                >
                  Ver cardápio
                </Link>
              </div>

              <ul className="mt-11 flex flex-wrap gap-x-8 gap-y-4">
                {[
                  ["Feito à mão", "sem produção em série"],
                  ["Montado no dia", "nunca congelado"],
                  ["Sob encomenda", "do seu jeito"],
                ].map(([titulo, apoio]) => (
                  <li key={titulo} className="border-l border-dourado/40 pl-3">
                    <p className="font-rotulo text-[0.62rem] uppercase tracking-[0.2em] text-cacau">
                      {titulo}
                    </p>
                    <p className="mt-1 text-xs text-tinta-tenue">{apoio}</p>
                  </li>
                ))}
              </ul>
            </Revela>

            {heroImagem && (
              <Revela className="relative">
                <div className="relative aspect-4/5 overflow-hidden rounded-[1.75rem] bg-creme">
                  <Image
                    src={heroImagem.url}
                    alt={heroImagem.alt}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 46vw"
                    className="object-cover"
                  />
                </div>

                {/* Medalhão, o mesmo que vai no topo dos bolos da casa. */}
                <div className="absolute -top-3 -right-3 hidden size-24 place-items-center rounded-full border border-dourado/50 bg-creme-fundo text-center sm:grid lg:-right-6">
                  <p className="font-rotulo text-[0.55rem] leading-tight uppercase tracking-[0.14em] text-cacau">
                    Feito
                    <br />
                    <span className="text-dourado">à mão</span>
                    <br />
                    hoje
                  </p>
                </div>
              </Revela>
            )}
          </div>

          {/* A fita, o elemento assinatura. Amarra uma seção na outra. */}
          <FitaDourada className="h-10 w-full" />
        </section>

        {/* ================= MAIS PEDIDOS ================= */}
        {destaques.length > 0 && (
          <section id="mais-pedidos" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-16 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-rotulo text-[0.68rem] uppercase tracking-[0.32em] text-terracota">
                  Os favoritos da casa
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,2.9rem)] leading-tight font-semibold text-cacau">
                  O que mais sai
                  <br />
                  da nossa bancada
                </h2>
              </div>
              <Link
                href="/cardapio"
                className="btn rounded-full border border-cacau/25 px-6 py-3 text-sm font-medium text-cacau transition-colors hover:border-cacau/50 hover:bg-cacau/5"
              >
                Ver tudo
              </Link>
            </div>

            <Revela as="ul" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {destaques.map((d, i) => (
                <li
                  key={d.id}
                  className="group overflow-hidden rounded-[1.5rem] border border-tinta/8 bg-creme-alto transition-all hover:-translate-y-1 hover:border-dourado/40 hover:shadow-xl hover:shadow-cacau/5"
                >
                  {d.imagem && (
                    <div className="relative aspect-square overflow-hidden bg-creme">
                      <Image
                        src={d.imagem.url}
                        alt={d.imagem.alt}
                        fill
                        sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      {i === 0 && (
                        <span className="absolute top-3 left-3 rounded-full bg-oliva px-3 py-1.5 font-rotulo text-[0.58rem] uppercase tracking-[0.14em] text-creme-alto">
                          Mais pedido
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-cacau">{d.titulo}</h3>
                    {d.texto && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-tinta-suave">
                        {d.texto}
                      </p>
                    )}
                    {d.menorPreco !== null && (
                      <p className="mt-4 flex items-baseline gap-1.5">
                        <span className="font-rotulo text-[0.6rem] uppercase tracking-widest text-tinta-tenue">
                          a partir de
                        </span>
                        <span className="font-display text-lg font-semibold text-terracota">
                          {formatarPreco(d.menorPreco)}
                        </span>
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </Revela>
          </section>
        )}

        {/* ================= SOBRE =================
            Esqueleto deliberadamente diferente da seção acima: faixa de cor
            cheia, imagem à esquerda, texto deslocado. Duas seções vizinhas
            nunca repetem o mesmo molde. */}
        {sobre && (
          <section id="sobre" className="scroll-mt-24 bg-oliva text-creme-alto">
            <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
              {sobre.imagem && (
                <Revela className="order-2 lg:order-1">
                  <div className="relative aspect-5/4 overflow-hidden rounded-[1.75rem]">
                    <Image
                      src={sobre.imagem.url}
                      alt={sobre.imagem.alt}
                      fill
                      sizes="(max-width: 1024px) 90vw, 46vw"
                      className="object-cover"
                    />
                  </div>
                </Revela>
              )}

              <Revela className="order-1 lg:order-2">
                {sobre.titulo && (
                  <h2 className="font-display text-[clamp(1.9rem,4.5vw,2.8rem)] leading-tight font-semibold">
                    {sobre.titulo}
                  </h2>
                )}
                <div className="mt-6 h-px w-20 bg-dourado-claro/70" />
                {sobre.corpo && (
                  <div
                    className="mt-6 max-w-[52ch] space-y-4 text-[1.05rem] leading-relaxed text-creme/85"
                    // O corpo vem de texto rico LIMITADO e é sanitizado no
                    // servidor antes de salvar. O admin nunca escreve HTML livre.
                    dangerouslySetInnerHTML={{ __html: sobre.corpo }}
                  />
                )}
                {instagram && (
                  <a
                    href={instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn mt-8 inline-flex rounded-full border border-creme/30 px-6 py-3 text-sm font-medium transition-colors hover:border-creme/60 hover:bg-creme/10"
                  >
                    Acompanhar no Instagram
                  </a>
                )}
              </Revela>
            </div>
          </section>
        )}

        {/* ================= CARDÁPIO ================= */}
        <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
          {cardapio.map((categoria) => (
            <div key={categoria.id} className="mb-16 last:mb-0">
              <div className="max-w-2xl">
                <p className="font-rotulo text-[0.68rem] uppercase tracking-[0.32em] text-terracota">
                  {categoria.unidade === "cento" ? "Vendido por cento" : "Bolos inteiros"}
                </p>
                <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold text-cacau">
                  {categoria.nome}
                </h2>
                {categoria.descricao && (
                  <p className="mt-3 text-tinta-suave">{categoria.descricao}</p>
                )}
              </div>

              {categoria.regras && (
                <div
                  className="mt-6 max-w-2xl rounded-2xl border border-terracota/25 bg-terracota/6 p-5 text-sm leading-relaxed text-tinta [&_strong]:font-semibold [&_strong]:text-terracota"
                  dangerouslySetInnerHTML={{ __html: categoria.regras }}
                />
              )}

              <Revela as="ul" className="mt-10 grid gap-6 md:grid-cols-2">
                {categoria.produtos.map((p) => (
                  <li
                    key={p.id}
                    className={`flex gap-5 rounded-[1.5rem] border border-tinta/8 bg-creme-alto p-5 transition-colors hover:border-dourado/40 ${
                      p.disponivel ? "" : "opacity-55"
                    }`}
                  >
                    {p.imagem && (
                      <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-creme sm:size-32">
                        <Image
                          src={p.imagem.url}
                          alt={p.imagem.alt}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold text-cacau">{p.nome}</h3>
                        {!p.disponivel && (
                          <span className="shrink-0 rounded-full bg-tinta/10 px-2.5 py-1 font-rotulo text-[0.55rem] uppercase tracking-wider text-tinta-suave">
                            Esgotado
                          </span>
                        )}
                      </div>

                      {p.descricao && (
                        <p className="mt-1.5 text-sm leading-relaxed text-tinta-suave">
                          {p.descricao}
                        </p>
                      )}

                      {/* O ponto difícil: até quatro preços num card só.
                          Uma linha por tamanho, em mono, alinhada pela base.
                          Fica escaneável e não vira uma tabela pesada. */}
                      <ul className="mt-4 space-y-1.5">
                        {p.variantes.map((v) => (
                          <li
                            key={v.id}
                            className="flex items-baseline gap-3 border-b border-tinta/6 pb-1.5 last:border-0"
                          >
                            <span className="font-rotulo text-[0.7rem] font-medium text-cacau">
                              {v.label}
                            </span>
                            {v.porcao && (
                              <span className="min-w-0 flex-1 truncate text-[0.7rem] text-tinta-tenue">
                                {v.porcao}
                              </span>
                            )}
                            <span className="ml-auto shrink-0 text-sm">
                              {v.precoPromo !== null ? (
                                <>
                                  <s className="mr-1.5 text-tinta-tenue">
                                    {formatarPreco(v.preco)}
                                  </s>
                                  <span className="font-semibold text-terracota">
                                    {formatarPreco(v.precoPromo)}
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium text-tinta">
                                  {formatarPreco(v.preco)}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </Revela>

              {categoria.canal && (
                <a
                  href={categoria.canal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn mt-8 inline-flex rounded-full bg-oliva px-7 py-3.5 font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
                >
                  Encomendar {categoria.nome.toLowerCase()} pelo {categoria.canal.nome}
                </a>
              )}
            </div>
          ))}
        </section>

        {/* ================= CONTATO ================= */}
        <section id="contato" className="scroll-mt-24 border-t border-tinta/8 bg-creme">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
            <Revela>
              <p className="font-rotulo text-[0.68rem] uppercase tracking-[0.32em] text-terracota">
                Onde nos achar
              </p>
              <h2 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-cacau">
                Passe na loja
              </h2>

              <div className="mt-6">
                <StatusHorario periodos={rodape.horarios} excecoes={rodape.excecoes} />
              </div>

              {/* FICTÍCIO: endereço de exemplo, o cliente ainda não informou o real. */}
              <address className="mt-6 text-[1.05rem] leading-relaxed text-tinta-suave not-italic">
                Bairro Ingleses
                <br />
                Florianópolis, Santa Catarina
              </address>

              <div className="mt-8 flex flex-wrap gap-3">
                {rodape.canais.map((c) => (
                  <a
                    key={c.url}
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn rounded-full bg-oliva px-6 py-3 text-sm font-medium text-creme-alto transition-colors hover:bg-oliva-escuro"
                  >
                    {c.nome}
                  </a>
                ))}
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

            <Revela>
              <h3 className="font-rotulo text-[0.68rem] uppercase tracking-[0.32em] text-tinta-tenue">
                Horário de funcionamento
              </h3>
              <div className="mt-6">
                <GradeHorarios periodos={rodape.horarios} />
              </div>
            </Revela>
          </div>
        </section>
      </main>

      {/* ================= RODAPÉ ================= */}
      <footer className="bg-cacau text-creme/70">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <FitaDourada className="mb-10 h-8 w-full opacity-60" />

          <div className="flex flex-wrap items-end justify-between gap-8">
            <div>
              <p className="font-display text-2xl font-semibold text-creme-alto">Dalami</p>
              <p className="mt-1 font-rotulo text-[0.6rem] uppercase tracking-[0.38em] text-creme/45">
                Confeitaria e Cafeteria
              </p>
              {rodape.config?.footerText && (
                <p className="mt-5 font-display text-lg text-dourado-claro">
                  {rodape.config.footerText}
                </p>
              )}
            </div>

            <nav aria-label="Rodapé" className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
              <Link className="transition-colors hover:text-creme-alto" href="#mais-pedidos">
                Mais pedidos
              </Link>
              <Link className="transition-colors hover:text-creme-alto" href="#sobre">
                Sobre
              </Link>
              <Link className="transition-colors hover:text-creme-alto" href="/cardapio">
                Cardápio
              </Link>
              {instagram && (
                <a
                  className="transition-colors hover:text-creme-alto"
                  href={instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
            </nav>
          </div>

          <p className="mt-10 border-t border-creme/10 pt-6 text-xs text-creme/40">
            © {new Date().getFullYear()} Dalami Confeitaria e Cafeteria. Ingleses, Florianópolis.
          </p>
        </div>
      </footer>
    </>
  );
}
