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
 * O exemplo é pequeno de propósito: uma categoria visível (Doces) com quatro
 * itens, mais dois itens de encomenda. O suficiente para ver o site de pé e
 * mexer no painel sem cansar, e fácil de apagar quando o cardápio real chegar.
 *
 * Quando o cliente mandar as fotos dele, elas entram pela biblioteca de mídia
 * do painel, nunca escritas no código.
 *
 * O script é idempotente (usa upsert): rodar duas vezes não duplica nada.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL não está definida.");

// O ?schema= da URL não tem efeito nenhum sobre o driver pg (mesmo bug que já
// mordeu o site em produção): precisa ir como segundo argumento do PrismaPg,
// não embutido na connection string. Ver src/lib/prisma.ts para a explicação
// completa.
const schema = new URL(connectionString).searchParams.get("schema") ?? undefined;
const adapter = new PrismaPg({ connectionString }, schema ? { schema } : undefined);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("\nPopulando o banco com o cardápio de exemplo...\n");

  // Limpeza: a categoria Combos saiu do briefing. Removida aqui para quem já
  // tinha rodado a versão anterior do seed não ficar com ela órfã no banco.
  const categoriasQueSairam = ["cat-combos", "cat-cafes", "cat-salgados"];
  await prisma.product.deleteMany({ where: { categoryId: { in: categoriasQueSairam } } });
  await prisma.category.deleteMany({ where: { id: { in: categoriasQueSairam } } });

  // Itens que sairam do exemplo para deixar o painel mais enxuto de mexer.
  await prisma.product.deleteMany({
    where: {
      id: {
        in: [
          "p-fatia-doce-de-leite",
          "p-fatia-coco",
          "p-cheesecake",
          "e-bolo-morango",
          "e-bolo-doce-de-leite",
          "e-bolo-coco",
          "e-torta-brigadeiro",
        ],
      },
    },
  });

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
    { id: "cat-doces", name: "Doces", slug: "doces", order: 0, active: true,
      description: "Bolos, tortas e docinhos feitos na confeitaria." },

    // Categoria INATIVA de propósito: `active: false` tira ela do cardápio do
    // dia a dia. Os itens continuam existindo e aparecem na página /encomenda,
    // porque foram adicionados ao cardápio de encomenda mais abaixo.
    // Bolo inteiro e cento de docinho não ficam na vitrine, mas são vendidos.
    { id: "cat-encomendas", name: "Encomendas", slug: "encomendas", order: 1, active: false,
      description: "Bolos inteiros e bandejas, feitos sob encomenda." },
  ];

  for (const c of categorias) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { active: c.active },
      create: c,
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
    // --- Doces -------------------------------------------------------------
    { id: "p-fatia-chocolate", categoryId: "cat-doces", name: "Fatia de bolo de chocolate",
      slug: "fatia-bolo-chocolate",
      description: "Massa úmida de chocolate com recheio cremoso e cereja.",
      price: "14.00", mediaId: "midia-bolo-chocolate", featured: true, order: 0 },
    { id: "p-fatia-morango", categoryId: "cat-doces", name: "Fatia de bolo de morango",
      slug: "fatia-bolo-morango",
      description: "Creme, morango fresco e merengue maçaricado.",
      price: "15.00", mediaId: "midia-bolo-morango", featured: true, order: 1 },
    { id: "p-torta-brigadeiro", categoryId: "cat-doces", name: "Torta de brigadeiro",
      slug: "torta-brigadeiro",
      description: "Brigadeiro cremoso sobre base crocante.",
      price: "16.00", promoPrice: "13.50", mediaId: "midia-torta-brigadeiro", order: 2 },
    { id: "p-brigadeiro", categoryId: "cat-doces", name: "Brigadeiro gourmet",
      slug: "brigadeiro-gourmet",
      description: "Unidade. Nove sabores no balcão todo dia.",
      price: "6.00", mediaId: "midia-docinhos", featured: true, order: 3 },

    // --- Encomendas (categoria inativa: só aparecem em /encomenda) ----------
    { id: "e-bolo-chocolate", categoryId: "cat-encomendas", name: "Bolo inteiro de chocolate",
      slug: "encomenda-bolo-chocolate",
      description: "Serve de 12 a 15 pessoas. Montado no dia da retirada.",
      price: "120.00", mediaId: "midia-bolo-chocolate", order: 0 },
    { id: "e-cento-brigadeiro", categoryId: "cat-encomendas", name: "Cento de brigadeiros",
      slug: "encomenda-cento-brigadeiros",
      description: "Cem unidades. Você escolhe os sabores na conversa.",
      price: "225.00", mediaId: "midia-docinhos", order: 1 },
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
  // Cada seção guarda a palavrinha de cima e a frase grande. Antes elas
  // moravam no código, e quando o cardápio mudou a home passou a prometer
  // "café, doce e salgado" sem ter mais café nem salgado.
  const secoes = [
    { key: "highlights", eyebrow: "Destaque da casa", heading: null },
    { key: "menu-cta",   eyebrow: "Cardápio",         heading: "Doce feito na casa, todo dia" },
    { key: "order-cta",  eyebrow: "Para uma data especial", heading: null },
    { key: "about",      eyebrow: "Sobre a casa",     heading: null },
    { key: "location",   eyebrow: "Onde estamos",     heading: null },
    { key: "hours",      eyebrow: "Horário",          heading: "Quando abrimos" },
    { key: "contact",    eyebrow: "Contato",          heading: "Fale com a gente" },
  ];

  for (const [i, s] of secoes.entries()) {
    await prisma.siteSection.upsert({
      where: { key: s.key },
      update: { eyebrow: s.eyebrow, heading: s.heading },
      create: { key: s.key, visible: true, order: i, eyebrow: s.eyebrow, heading: s.heading },
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
        "<p>Bolo inteiro para uma data especial, ou bandeja de docinho para " +
        "uma festa. Escolha abaixo o que você quer e fale com a gente no " +
        "WhatsApp para fechar o pedido.</p>",
      whatsappNumber: "5548999999999", // PLACEHOLDER
      active: true,
    },
  });

  // O cardápio de encomenda. O admin escolhe o que entra aqui e em que ordem.
  const itensEncomenda = ["e-bolo-chocolate", "e-cento-brigadeiro"];

  for (const [i, productId] of itensEncomenda.entries()) {
    await prisma.orderSectionItem.upsert({
      where: { sectionId_productId: { sectionId: "singleton", productId } },
      update: { order: i },
      create: { sectionId: "singleton", productId, order: i },
    });
  }

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
      addressFull: "Rua das Gaivotas, 1000 - Ingleses, Florianópolis - SC", // PLACEHOLDER
    },
  });

  // Campos novos ganham um valor de exemplo só quando ainda estão vazios.
  // O upsert acima usa `update: {}` de propósito, para não apagar o que o dono
  // já editou; sem este passo, um campo criado depois nunca seria preenchido.
  const config = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (config && !config.addressFull) {
    await prisma.siteSettings.update({
      where: { id: "singleton" },
      // PLACEHOLDER: endereço de exemplo, para o link do Google Maps funcionar.
      data: { addressFull: "Rua das Gaivotas, 1000 - Ingleses, Florianópolis - SC" },
    });
  }

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
