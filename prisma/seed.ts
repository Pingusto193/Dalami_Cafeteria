/**
 * SEED DE DEMONSTRAÇÃO
 *
 * ATENÇÃO, LEIA ANTES DE MOSTRAR ESTE SITE AO CLIENTE:
 *
 * O cardápio real da Dalami (7 categorias, 21 sabores, preços por tamanho)
 * ainda NÃO foi recebido. O arquivo `cardapio-dalami-seed.json` citado no
 * briefing não existe, e o PDF do cliente também não.
 *
 * Tudo marcado com FICTÍCIO abaixo foi INVENTADO só para a tela não ficar
 * vazia. Nenhum nome de sabor, preço, descrição, endereço ou telefone daqui
 * é informação real do negócio.
 *
 * O que É real e pode ficar:
 *   - as fotos dos bolos (são do PDF do próprio cliente)
 *   - o Instagram @dalamicafeteria
 *   - as frases de marca "A vida merece ser saboreada"
 *   - a estrutura de tamanhos P/M/G/GG com as fatias
 *   - as regras de encomenda (2 dias, sinal de 50%, retirada na loja)
 *   - o brigadeiro a R$ 225,00 o cento, mínimo de 50 unidades
 *
 * QUANDO O CARDÁPIO REAL CHEGAR: troque os produtos por aqui e rode
 * `npm run db:seed` de novo. O script é idempotente (usa upsert), então
 * rodar duas vezes não duplica nada.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Populando o banco com dados de demonstração...\n");

  // ---------------------------------------------------------------------------
  // Canais de pedido
  // ---------------------------------------------------------------------------
  // FICTÍCIO: o número de WhatsApp é de exemplo. Trocar pelo real do cliente.
  const whatsapp = await prisma.orderChannel.upsert({
    where: { id: "canal-whatsapp" },
    update: {},
    create: {
      id: "canal-whatsapp",
      name: "WhatsApp",
      type: "whatsapp",
      urlOrPhone: "https://wa.me/5548999999999", // FICTÍCIO
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
  // Mídia (fotos reais do PDF do cliente)
  // ---------------------------------------------------------------------------
  const midias = [
    {
      id: "midia-hero",
      url: "/seed/hero-brigadeiro.jpeg",
      altText: "Bolo de brigadeiro com cobertura de doce de leite e fita dourada da Dalami",
      width: 2048,
      height: 1365,
      sizeBytes: 186297,
      usageContext: "hero",
    },
    {
      id: "midia-chocolate",
      url: "/seed/bolo-chocolate-cereja.jpeg",
      altText: "Bolo de chocolate com cerejas no topo e lascas de chocolate ao redor",
      width: 4284,
      height: 5712,
      sizeBytes: 129819,
      usageContext: "product",
    },
    {
      id: "midia-morango",
      url: "/seed/bolo-morango-merengue.jpeg",
      altText: "Bolo de morango com merengue maçaricado e medalhão dourado da Dalami",
      width: 2268,
      height: 3024,
      sizeBytes: 216144,
      usageContext: "product",
    },
    {
      id: "midia-doce-de-leite",
      url: "/seed/bolo-doce-de-leite.jpeg",
      altText: "Bolo de doce de leite com chocolate branco e laço dourado da Dalami",
      width: 2268,
      height: 3024,
      sizeBytes: 339354,
      usageContext: "product",
    },
  ];

  for (const midia of midias) {
    await prisma.media.upsert({ where: { id: midia.id }, update: midia, create: midia });
  }

  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------
  // As regras de encomenda abaixo são REAIS, vieram do briefing do cliente.
  const bolos = await prisma.category.upsert({
    where: { slug: "bolos" },
    update: {},
    create: {
      id: "cat-bolos",
      name: "Bolos inteiros",
      slug: "bolos",
      description: "Bolos artesanais feitos por encomenda, montados no dia da retirada.",
      order: 0,
      active: true,
      unitType: "unidade",
      orderingNote:
        "<p>Pedidos com no mínimo <strong>2 dias de antecedência</strong>. " +
        "O pedido é confirmado com o pagamento de <strong>50% do valor</strong>. " +
        "A retirada é agendada na loja. Não fazemos decoração personalizada.</p>",
      preferredOrderChannelId: whatsapp.id,
    },
  });

  const brigadeiros = await prisma.category.upsert({
    where: { slug: "brigadeiros" },
    update: {},
    create: {
      id: "cat-brigadeiros",
      name: "Brigadeiros",
      slug: "brigadeiros",
      description: "Vendidos por cento, com sabores escolhidos na hora do pedido.",
      order: 1,
      active: true,
      unitType: "cento",
      orderingNote:
        "<p>Pedido mínimo de <strong>50 unidades</strong>. " +
        "Você escolhe até <strong>4 sabores por cento</strong> " +
        "(ou 2 sabores no meio cento). A escolha dos sabores acontece na conversa do WhatsApp.</p>",
      preferredOrderChannelId: whatsapp.id,
    },
  });

  // ---------------------------------------------------------------------------
  // Produtos — TODOS OS NOMES, DESCRIÇÕES E PREÇOS DE BOLO SÃO FICTÍCIOS
  // ---------------------------------------------------------------------------
  // As informações de fatias por tamanho são REAIS (vieram do briefing).
  const TAMANHOS = [
    { label: "P", servingsInfo: "17 cm, 10 a 12 fatias" },
    { label: "M", servingsInfo: "20 cm, 22 a 25 fatias" },
    { label: "G", servingsInfo: "25 cm, 40 a 45 fatias" },
    { label: "GG", servingsInfo: "30 x 20 cm, 65 a 70 fatias" },
  ];

  const produtos = [
    {
      id: "prod-chocolate-cereja",
      name: "Chocolate com Cereja", // FICTÍCIO
      slug: "chocolate-com-cereja",
      description:
        "Massa de chocolate, recheio cremeiro e cerejas no topo, fechado com lascas de chocolate meio amargo.", // FICTÍCIO
      mediaId: "midia-chocolate",
      featured: true,
      order: 0,
      precos: ["89.00", "149.00", "239.00", "329.00"], // FICTÍCIO
    },
    {
      id: "prod-morango-merengue",
      name: "Morango com Merengue", // FICTÍCIO
      slug: "morango-com-merengue",
      description:
        "Camadas de creme e morango fresco, cobertas com merengue maçaricado na hora.", // FICTÍCIO
      mediaId: "midia-morango",
      featured: true,
      order: 1,
      precos: ["95.00", "159.00", "249.00", "339.00"], // FICTÍCIO
    },
    {
      id: "prod-doce-de-leite",
      name: "Doce de Leite com Chocolate", // FICTÍCIO
      slug: "doce-de-leite-com-chocolate",
      description:
        "Doce de leite cremoso entre camadas de chocolate, com chocolate branco e granulado belga.", // FICTÍCIO
      mediaId: "midia-doce-de-leite",
      featured: false,
      order: 2,
      precos: ["92.00", "155.00", "245.00", "335.00"], // FICTÍCIO
    },
  ];

  for (const p of produtos) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        categoryId: bolos.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        mediaId: p.mediaId,
        featured: p.featured,
        available: true,
        order: p.order,
        variants: {
          create: TAMANHOS.map((t, i) => ({
            label: t.label,
            price: p.precos[i],
            servingsInfo: t.servingsInfo,
            order: i,
          })),
        },
      },
    });
  }

  // Brigadeiro: o preço do cento é REAL (R$ 225,00, do briefing).
  // O preço do MEIO CENTO não foi informado pelo cliente e NÃO deve ser inventado.
  await prisma.product.upsert({
    where: { slug: "brigadeiros-gourmet" },
    update: {},
    create: {
      id: "prod-brigadeiros",
      categoryId: brigadeiros.id,
      name: "Brigadeiros gourmet",
      slug: "brigadeiros-gourmet",
      description:
        "Nove sabores disponíveis. Você escolhe até quatro por cento na hora do pedido.",
      featured: false,
      available: true,
      order: 0,
      variants: {
        create: [
          {
            label: "Cento (100 un)",
            price: "225.00", // REAL
            servingsInfo: "100 unidades, pedido mínimo de 50",
            order: 0,
          },
        ],
      },
    },
  });

  // ---------------------------------------------------------------------------
  // Blocos de conteúdo
  // ---------------------------------------------------------------------------
  await prisma.contentBlock.upsert({
    where: { key: "sobre" },
    update: {},
    create: {
      key: "sobre",
      title: "Cada pedaço da vida merece ser saboreado", // REAL (assinatura da marca)
      // FICTÍCIO: texto de exemplo até o cliente enviar o texto institucional dele.
      body:
        "<p>A Dalami nasceu da vontade de fazer bolo do jeito antigo, com tempo e " +
        "com as mãos. Cada encomenda é montada no dia da retirada, para chegar " +
        "na sua mesa do jeito que saiu da nossa bancada.</p>",
      mediaId: "midia-hero",
      order: 0,
      visible: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Seções da home (controlam o que aparece e em que ordem)
  // ---------------------------------------------------------------------------
  const secoes = ["highlights", "about", "menu-cta", "contact", "hours"];
  for (const [i, key] of secoes.entries()) {
    await prisma.siteSection.upsert({
      where: { key },
      update: {},
      create: { key, visible: true, order: i },
    });
  }

  // ---------------------------------------------------------------------------
  // Destaques
  // ---------------------------------------------------------------------------
  await prisma.highlight.upsert({
    where: { id: "destaque-chocolate" },
    update: {},
    create: {
      id: "destaque-chocolate",
      kind: "product",
      productId: "prod-chocolate-cereja",
      order: 0,
      active: true,
    },
  });

  await prisma.highlight.upsert({
    where: { id: "destaque-morango" },
    update: {},
    create: {
      id: "destaque-morango",
      kind: "product",
      productId: "prod-morango-merengue",
      order: 1,
      active: true,
    },
  });

  // ---------------------------------------------------------------------------
  // Horários — FICTÍCIO: horário de exemplo até o cliente informar o real.
  // ---------------------------------------------------------------------------
  const horarios = [
    { dayOfWeek: 0, closed: false, opensAt: "08:00", closesAt: "18:00" }, // domingo
    { dayOfWeek: 1, closed: true, opensAt: null, closesAt: null }, // segunda, fechado
    { dayOfWeek: 2, closed: false, opensAt: "08:00", closesAt: "18:00" },
    { dayOfWeek: 3, closed: false, opensAt: "08:00", closesAt: "18:00" },
    { dayOfWeek: 4, closed: false, opensAt: "08:00", closesAt: "18:00" },
    { dayOfWeek: 5, closed: false, opensAt: "08:00", closesAt: "18:00" },
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
  // Configurações do site (singleton)
  // ---------------------------------------------------------------------------
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      siteName: "Dalami Confeitaria e Cafeteria",
      seoTitle: "Dalami Confeitaria e Cafeteria | Bolos artesanais nos Ingleses",
      seoDescription:
        "Bolos artesanais feitos por encomenda no bairro Ingleses, em Florianópolis. A vida merece ser saboreada.",
      seoImageMediaId: "midia-hero",
      footerText: "A vida merece ser saboreada.", // REAL (assinatura da marca)
    },
  });

  console.log("Pronto.\n");
  console.log("  4 imagens, 2 categorias, 4 produtos, 13 variantes de preço");
  console.log("  2 destaques, 1 bloco de texto, 5 seções, 7 dias de horário\n");
  console.log("  LEMBRETE: nomes, preços de bolo, telefone e horário são FICTÍCIOS.");
  console.log("  Só as fotos, o Instagram e o brigadeiro a R$ 225,00 o cento são reais.\n");
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
