import Link from "next/link";
import { prisma } from "@/lib/prisma";

/**
 * Tela inicial do painel.
 *
 * Ela existe para responder uma pergunta só: "o que eu posso mexer aqui?".
 * O dono não é técnico, então cada cartão diz em palavras do dia a dia o que
 * aquela seção muda no site, e mostra quantos itens já existem.
 */

async function contagens() {
  const [categorias, produtos, destaques, blocos, imagens, encomendaItens, redes] =
    await Promise.all([
      prisma.category.count(),
      prisma.product.count(),
      prisma.highlight.count({ where: { active: true } }),
      prisma.contentBlock.count(),
      prisma.media.count(),
      prisma.orderSectionItem.count(),
      prisma.socialLink.count({ where: { active: true } }),
    ]);
  return { categorias, produtos, destaques, blocos, imagens, encomendaItens, redes };
}

export default async function PainelInicio() {
  const n = await contagens();

  const cartoes = [
    {
      href: "/admin/cardapio",
      titulo: "Cardápio",
      texto: "Criar e editar os itens que aparecem no cardápio, com preço, foto e promoção.",
      contagem: `${n.categorias} categorias, ${n.produtos} itens`,
    },
    {
      href: "/admin/destaques",
      titulo: "Destaques",
      texto: "Escolher o que aparece girando no topo da página inicial.",
      contagem: `${n.destaques} ativos`,
    },
    {
      href: "/admin/encomenda",
      titulo: "Encomenda",
      texto: "O texto, o WhatsApp e quais itens ficam na página de encomenda.",
      contagem: `${n.encomendaItens} itens na lista`,
    },
    {
      href: "/admin/sobre",
      titulo: "Sobre",
      texto: "Os blocos de texto e foto que contam a história da casa.",
      contagem: `${n.blocos} blocos`,
    },
    {
      href: "/admin/horario",
      titulo: "Horário",
      texto: "Os horários de cada dia da semana, e quando a loja fecha.",
      contagem: "7 dias",
    },
    {
      href: "/admin/contato",
      titulo: "Contato",
      texto: "Instagram, WhatsApp, iFood e outros links que aparecem no site.",
      contagem: `${n.redes} redes`,
    },
    {
      href: "/admin/site",
      titulo: "Dados do site",
      texto: "Nome, frase do rodapé, bairro da loja e o texto que aparece no Google.",
      contagem: null,
    },
    {
      href: "/admin/imagens",
      titulo: "Imagens",
      texto: "Enviar fotos novas e reaproveitar as que já estão no site.",
      contagem: `${n.imagens} imagens`,
    },
  ];

  return (
    <>
      <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-semibold text-cacau">
        O que você quer mudar?
      </h1>
      <p className="mt-2 max-w-[58ch] text-tinta-suave">
        Tudo que você alterar aqui aparece no site na hora. Não precisa avisar
        ninguém nem publicar nada depois.
      </p>

      <ul className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((c) => (
          <li key={c.href}>
            <Link
              href={c.href}
              className="group flex h-full flex-col rounded-[1.25rem] border border-tinta/10 bg-creme-alto p-6 transition-all hover:-translate-y-0.5 hover:border-dourado/50 hover:shadow-lg hover:shadow-cacau/5"
            >
              <h2 className="font-display text-xl font-semibold text-cacau">{c.titulo}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-tinta-suave">{c.texto}</p>
              {c.contagem && (
                <p className="mt-5 font-rotulo text-[0.6rem] uppercase tracking-[0.16em] text-terracota">
                  {c.contagem}
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    &rarr;
                  </span>
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
