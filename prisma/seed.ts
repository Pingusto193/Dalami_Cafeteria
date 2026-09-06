/**
 * SEED DE DEMONSTRAÇÃO
 *
 * LEIA ANTES DE MOSTRAR ESTE SITE AO CLIENTE.
 *
 * O cardápio real da Dalami ainda NÃO foi recebido. Tudo aqui é um cardápio
 * de EXEMPLO plausível para uma confeitaria e cafeteria de bairro, montado só
 * para a tela não ficar vazia e para o admin ter o que editar.
 *
 * É PLACEHOLDER e deve ser substituído inteiro quando o cardápio real chegar:
 *   - nomes de item, descrições e preços
 *   - o texto institucional da seção Sobre
 *   - endereço, região, número de WhatsApp e link do iFood
 *   - o horário de funcionamento
 *
 * O que É real e pode ficar:
 *   - as fotos (são fotos de estúdio de verdade, usadas aqui só como
 *     fotografia de produto de exemplo; NÃO representam o cardápio do cliente)
 *   - o Instagram @dalamicafeteria
 *   - as frases de marca "A vida merece ser saboreada" e
 *     "Cada pedaço da vida merece ser saboreado"
 *
 * As fotos são todas de bolos e docinhos, então só os itens de Doces têm
 * imagem. Cafés, Salgados e Combos ficam sem foto de propósito: inventar
 * imagem de café por IA seria pior que um card bem desenhado sem foto.
 * Quando o cliente mandar fotos próprias, elas entram pela biblioteca de
 * mídia do admin, nunca escritas no código.
 *
 * O script é idempotente (usa upsert): rodar duas vezes não duplica nada.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("\nPopulando o banco com o cardápio de exemplo...\n");

  // ---------------------------------------------------------------------------
  // Mídia
  // ---------------------------------------------------------------------------
  const midias = [
    {
      id: "midia-docinhos",
      url: "/seed/docinhos.jpeg",
      altText: "Bandeja de brigadeiros variados no balcão da confeitaria",
      width: 630,
      height: 1120,
      sizeBytes: 184238,
      usageContext: "product",
    },
    {
      id: "midia-bolo-chocolate",
      url: "/seed/bolo-chocolate.jpeg",
      altText: "Bolo de chocolate com cerejas e lascas de chocolate meio amargo",
      width: 4284,
      height: 5712,
      sizeBytes: 129819,
      usageContext: "product",
    },
    {
      id: "midia-bolo-morango",
      url: "/seed/bolo-morango.jpeg",
      altText: "Bolo de morango coberto com merengue maçaricado",
      width: 2268,
      height: 3024,
      sizeBytes: 216144,
      usageContext: "product",
    },
    {
      id: "midia-bolo-doce-de-leite",
      url: "/seed/bolo-doce-de-leite.jpeg",
      altText: "Bolo de doce de leite com chocolate branco e granulado",
      width: 2268,
      height: 3024,
      sizeBytes: 339354,
      usageContext: "product",
    },
    {
      id: "midia-bolo-coco",
      url: "/seed/bolo-coco.jpeg",
      altText: "Bolo de coco com doce de leite e fios de ovos",
      width: 2268,
      height: 3024,
      sizeBytes: 281554,
      usageContext: "product",
    },
    {
      id: "midia-torta-brigadeiro",
      url: "/seed/torta-brigadeiro.jpeg",
      altText: "Torta de brigadeiro com doce de leite vista de cima",
      width: 2048,
      height: 1365,
      sizeBytes: 186297,
      usageContext: "hero",
    },
    {
      // Esta foto aparenta ser de banco de imagens, não da loja.
      // Serve como placeholder, mas nunca deve ser chamada de "foto da Dalami".
      id: "midia-cheesecake",
      url: "/seed/cheesecake.jpeg",
      altText: "Fatia de cheesecake com calda de frutas vermelhas",
      width: 3398,
      height: 5096,
      sizeBytes: 206293,
      usageContext: "product",
    },
  ];

  for (const m of midias) {
    await prisma.media.upsert({ where: { id: m.id }, update: m, create: m });
  }

  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------
  const categorias = [
    { id: "cat-cafes", name: "Cafés", slug: "cafes", order: 0,
      description: "Grãos moídos na hora, tirados no balcão." },
    { id: "cat-doces", name: "Doces", slug: "doces", order: 1,
      description: "Bolos, tortas e docinhos feitos na confeitaria." },
    { id: "cat-salgados", name: "Salgados", slug: "salgados", order: 2,
      description: "Assados do dia, para acompanhar o café." },
    { id: "cat-combos", name: "Combos", slug: "combos", order: 3,
      description: "Café e acompanhamento com preço fechado." },
  ];

  for (const c of categorias) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, active: true },
    });
  }

  // ---------------------------------------------------------------------------
  // Produtos — TODOS OS NOMES, DESCRIÇÕES E PREÇOS SÃO DE EXEMPLO
  // ---------------------------------------------------------------------------
  type Item = {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    price: string;
    promoPrice?: string;
    mediaId?: string;
    featured?: boolean;
    available?: boolean;
    order: number;
  };

  const itens: Item[] = [
    // --- Cafés -------------------------------------------------------------
    { id: "p-espresso", categoryId: "cat-cafes", name: "Espresso", slug: "espresso",
      description: "Curto, encorpado, tirado na hora.", price: "6.50", order: 0 },
    { id: "p-coado", categoryId: "cat-cafes", name: "Café coado da casa", slug: "cafe-coado-da-casa",
      description: "Coado no pano, servido em xícara grande.", price: "7.00", order: 1 },
    { id: "p-cappuccino", categoryId: "cat-cafes", name: "Cappuccino", slug: "cappuccino",
      description: "Espresso, leite vaporizado e canela por cima.", price: "12.00",
      featured: true, order: 2 },
    { id: "p-latte", categoryId: "cat-cafes", name: "Latte", slug: "latte",
      description: "Mais leite, menos amargor. Vai bem com doce.", price: "13.00", order: 3 },
    { id: "p-mocha", categoryId: "cat-cafes", name: "Mocha", slug: "mocha",
      description: "Espresso com chocolate meio amargo e leite.", price: "15.00", order: 4 },
    { id: "p-chocolate-quente", categoryId: "cat-cafes", name: "Chocolate quente", slug: "chocolate-quente",
      description: "Chocolate derretido na hora, sem pó solúvel.", price: "14.00", order: 5 },

    // --- Doces -------------------------------------------------------------
    { id: "p-fatia-chocolate", categoryId: "cat-doces", name: "Fatia de bolo de chocolate",
      slug: "fatia-bolo-chocolate",
      description: "Massa úmida de chocolate com recheio cremoso e cereja.",
      price: "14.00", mediaId: "midia-bolo-chocolate", featured: true, order: 0 },
    { id: "p-fatia-morango", categoryId: "cat-doces", name: "Fatia de bolo de morango",
      slug: "fatia-bolo-morango",
      description: "Creme, morango fresco e merengue maçaricado.",
      price: "15.00", mediaId: "midia-bolo-morango", featured: true, order: 1 },
    { id: "p-fatia-doce-de-leite", categoryId: "cat-doces", name: "Fatia de bolo de doce de leite",
      slug: "fatia-bolo-doce-de-leite",
      description: "Doce de leite entre camadas de chocolate branco.",
      price: "15.00", mediaId: "midia-bolo-doce-de-leite", order: 2 },
    { id: "p-fatia-coco", categoryId: "cat-doces", name: "Fatia de bolo de coco",
      slug: "fatia-bolo-coco",
      description: "Coco queimado, doce de leite e fios de ovos.",
      price: "16.00", mediaId: "midia-bolo-coco", order: 3 },
    { id: "p-torta-brigadeiro", categoryId: "cat-doces", name: "Torta de brigadeiro",
      slug: "torta-brigadeiro",
      description: "Brigadeiro cremoso sobre base crocante.",
      price: "16.00", promoPrice: "13.50", mediaId: "midia-torta-brigadeiro", order: 4 },
    { id: "p-brigadeiro", categoryId: "cat-doces", name: "Brigadeiro gourmet",
      slug: "brigadeiro-gourmet",
      description: "Unidade. Nove sabores no balcão todo dia.",
      price: "6.00", mediaId: "midia-docinhos", featured: true, order: 5 },
    { id: "p-cheesecake", categoryId: "cat-doces", name: "Cheesecake",
      slug: "cheesecake",
      description: "Fatia com calda de frutas vermelhas.",
      price: "18.00", mediaId: "midia-cheesecake", available: false, order: 6 },

    // --- Salgados ----------------------------------------------------------
    { id: "p-pao-de-queijo", categoryId: "cat-salgados", name: "Pão de queijo", slug: "pao-de-queijo",
      description: "Assado de hora em hora. Servido quente.", price: "7.00", order: 0 },
    { id: "p-coxinha", categoryId: "cat-salgados", name: "Coxinha de frango", slug: "coxinha-de-frango",
      description: "Frango desfiado com catupiry.", price: "9.50", order: 1 },
    { id: "p-empada", categoryId: "cat-salgados", name: "Empada de palmito", slug: "empada-de-palmito",
      description: "Massa amanteigada, recheio cremoso.", price: "9.00", order: 2 },
    { id: "p-croissant", categoryId: "cat-salgados", name: "Croissant de presunto e queijo",
      slug: "croissant-presunto-queijo",
      description: "Massa folhada feita na casa.", price: "14.00", order: 3 },
    { id: "p-misto", categoryId: "cat-salgados", name: "Misto quente", slug: "misto-quente",
      description: "Pão de forma na chapa, presunto e queijo.", price: "13.00", order: 4 },

    // --- Combos ------------------------------------------------------------
    { id: "p-combo-manha", categoryId: "cat-combos", name: "Café com pão de queijo",
      slug: "combo-cafe-pao-de-queijo",
      description: "Café coado e dois pães de queijo.",
      price: "13.50", promoPrice: "12.00", order: 0 },
    { id: "p-combo-tarde", categoryId: "cat-combos", name: "Cappuccino com fatia de bolo",
      slug: "combo-cappuccino-bolo",
      description: "Cappuccino e uma fatia do bolo do dia.",
      price: "26.00", promoPrice: "24.00", featured: true, order: 1 },
    { id: "p-combo-dois", categoryId: "cat-combos", name: "Café da tarde para dois",
      slug: "combo-cafe-da-tarde-para-dois",
      description: "Dois cafés, duas fatias de bolo e dois docinhos.",
      price: "45.00", order: 2 },
  ];

  for (const i of itens) {
    const { promoPrice, mediaId, featured, available, ...resto } = i;
    await prisma.product.upsert({
      where: { slug: i.slug },
      update: {},
      create: {
        ...resto,
        promoPrice: promoPrice ?? null,
        mediaId: mediaId ?? null,
        featured: featured ?? false,
        available: available ?? true,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Destaques (o hero animado da home)
  // ---------------------------------------------------------------------------
  const destaques = [
    { id: "d-torta", productId: "p-torta-brigadeiro", order: 0 },
    { id: "d-morango", productId: "p-fatia-morango", order: 1 },
    { id: "d-brigadeiro", productId: "p-brigadeiro", order: 2 },
    { id: "d-chocolate", productId: "p-fatia-chocolate", order: 3 },
  ];

  for (const d of destaques) {
    await prisma.highlight.upsert({
      where: { id: d.id },
      update: {},
      create: { id: d.id, kind: "product", productId: d.productId, order: d.order, active: true },
    });
  }

  // ---------------------------------------------------------------------------
  // Blocos da seção Sobre
  //
  // O lado da imagem alterna sozinho pela posição: order par = imagem à
  // esquerda, ímpar = imagem à direita. O admin não escolhe o lado.
  // ---------------------------------------------------------------------------
  const blocos = [
    {
      key: "sobre-1",
      title: "Cada pedaço da vida merece ser saboreado",
      body:
        "<p>A Dalami é uma confeitaria e cafeteria de bairro nos Ingleses. " +
        "Fazemos bolo, docinho e salgado na nossa própria cozinha, todo dia, " +
        "e servimos café tirado na hora no balcão.</p>",
      mediaId: "midia-torta-brigadeiro",
      order: 0,
    },
    {
      key: "sobre-2",
      title: "Feito aqui, servido aqui",
      body:
        "<p>Nada vem congelado de fora. O que está na vitrine saiu da nossa " +
        "cozinha hoje de manhã, e é isso que muda o gosto.</p>",
      mediaId: "midia-docinhos",
      order: 1,
    },
  ];

  for (const b of blocos) {
    await prisma.contentBlock.upsert({
      where: { key: b.key },
      update: {},
      create: { ...b, visible: true },
    });
  }

  // ---------------------------------------------------------------------------
  // Seções da home, na ordem definida no briefing
  // ---------------------------------------------------------------------------
  const secoes = [
    "highlights",
    "menu-cta",
    "order-cta",
    "about",
    "location",
    "hours",
    "contact",
  ];

  for (const [i, key] of secoes.entries()) {
    await prisma.siteSection.upsert({
      where: { key },
      update: {},
      create: { key, visible: true, order: i },
    });
  }

  // ---------------------------------------------------------------------------
  // Canal de compra — PLACEHOLDER, o link real do iFood não foi informado
  // ---------------------------------------------------------------------------
  await prisma.orderChannel.upsert({
    where: { id: "canal-ifood" },
    update: {},
    create: {
      id: "canal-ifood",
      name: "iFood",
      type: "ifood",
      urlOrPhone: "https://www.ifood.com.br/", // PLACEHOLDER
      order: 0,
      active: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Redes sociais
  // ---------------------------------------------------------------------------
  await prisma.socialLink.upsert({
    where: { id: "social-instagram" },
    update: {},
    create: {
      id: "social-instagram",
      platform: "Instagram",
      url: "https://instagram.com/dalamicafeteria", // REAL
      order: 0,
      active: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Seção "Fazer encomenda" — PLACEHOLDER, número real não informado
  // ---------------------------------------------------------------------------
  await prisma.orderSection.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      title: "Fazer encomenda",
      description:
        "<p>Quer um bolo para uma data especial, ou docinhos para uma festa? " +
        "Fale com a gente no WhatsApp e a gente monta o pedido junto com você.</p>",
      whatsappNumber: "5548999999999", // PLACEHOLDER
      active: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Horários — PLACEHOLDER, o horário real não foi informado
  // ---------------------------------------------------------------------------
  const horarios = [
    { dayOfWeek: 0, closed: false, opensAt: "08:00", closesAt: "13:00" }, // domingo
    { dayOfWeek: 1, closed: true, opensAt: null, closesAt: null }, // segunda
    { dayOfWeek: 2, closed: false, opensAt: "08:00", closesAt: "19:00" },
    { dayOfWeek: 3, closed: false, opensAt: "08:00", closesAt: "19:00" },
    { dayOfWeek: 4, closed: false, opensAt: "08:00", closesAt: "19:00" },
    { dayOfWeek: 5, closed: false, opensAt: "08:00", closesAt: "19:00" },
    { dayOfWeek: 6, closed: false, opensAt: "08:00", closesAt: "18:00" },
  ];

  for (const h of horarios) {
    await prisma.businessHours.upsert({
      where: { dayOfWeek_periodOrder: { dayOfWeek: h.dayOfWeek, periodOrder: 0 } },
      update: {},
      create: { ...h, periodOrder: 0 },
    });
  }

  // ---------------------------------------------------------------------------
  // Configurações do site
  // ---------------------------------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Dalami Confeitaria e Cafeteria",
      seoTitle: "Dalami Confeitaria e Cafeteria | Ingleses, Florianópolis",
      seoDescription:
        "Confeitaria e cafeteria no bairro Ingleses, em Florianópolis. Bolos, docinhos, salgados e café tirado na hora.",
      seoImageMediaId: "midia-torta-brigadeiro",
      footerText: "A vida merece ser saboreada.", // REAL
      locationRegion: "Bairro Ingleses, Florianópolis - SC", // PLACEHOLDER
      locationNote: "Venha nos visitar. O café está sempre saindo.", // PLACEHOLDER
    },
  });

  const total = await prisma.product.count();
  console.log("Pronto.\n");
  console.log(`  ${midias.length} imagens, ${categorias.length} categorias, ${total} itens`);
  console.log(`  ${destaques.length} destaques, ${blocos.length} blocos de Sobre, ${secoes.length} seções\n`);
  console.log("  LEMBRETE: o cardápio inteiro é de EXEMPLO. Telefone, iFood,");
  console.log("  horário e endereço também. Trocar quando o cliente enviar os dados.\n");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
