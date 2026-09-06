import { prisma } from "@/lib/prisma";
import type {
  CategoriaView,
  DestaqueView,
  ImagemView,
} from "@/lib/formato";

export type {
  CategoriaView,
  DestaqueView,
  ImagemView,
  ProdutoView,
} from "@/lib/formato";
export { formatarPreco } from "@/lib/formato";

/**
 * Consultas do site público.
 *
 * Regra que atravessa este arquivo: `price` é Decimal no banco, e Decimal não
 * atravessa a fronteira servidor/cliente do React. Todo preço sai daqui já
 * convertido para número, num lugar só.
 */

function imagem(m: {
  url: string;
  altText: string;
  width: number;
  height: number;
} | null): ImagemView | null {
  return m ? { url: m.url, alt: m.altText, largura: m.width, altura: m.height } : null;
}

/** Uma promoção só vale se o preço existir e hoje estiver dentro da janela. */
function promoAtiva(
  promoPrice: unknown,
  inicio: Date | null,
  fim: Date | null,
  agora: Date,
): boolean {
  if (promoPrice === null || promoPrice === undefined) return false;
  if (inicio && agora < inicio) return false;
  if (fim && agora > fim) return false;
  return true;
}

export async function buscarCardapio(): Promise<CategoriaView[]> {
  const agora = new Date();

  const categorias = await prisma.category.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      products: {
        orderBy: { order: "asc" },
        include: { media: true },
      },
    },
  });

  return categorias.map((c) => ({
    id: c.id,
    nome: c.name,
    slug: c.slug,
    descricao: c.description,
    produtos: c.products.map((p) => ({
      id: p.id,
      nome: p.name,
      slug: p.slug,
      descricao: p.description,
      preco: Number(p.price),
      precoPromo: promoAtiva(p.promoPrice, p.promoStartsAt, p.promoEndsAt, agora)
        ? Number(p.promoPrice)
        : null,
      destaque: p.featured,
      disponivel: p.available,
      imagem: imagem(p.media),
    })),
  }));
}

export async function buscarDestaques(): Promise<DestaqueView[]> {
  const agora = new Date();

  const destaques = await prisma.highlight.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: agora } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: agora } }] },
      ],
    },
    orderBy: { order: "asc" },
    include: { media: true, product: { include: { media: true } } },
  });

  return destaques
    // Um destaque que aponta para produto indisponível sai da vitrine.
    .filter((d) => d.kind !== "product" || (d.product && d.product.available))
    .map((d) => ({
      id: d.id,
      titulo: d.customTitle ?? d.product?.name ?? null,
      texto: d.customText ?? d.product?.description ?? null,
      link: d.customLinkUrl,
      slug: d.product?.slug ?? null,
      imagem: imagem(d.product?.media ?? d.media),
      preco: d.product ? Number(d.product.price) : null,
      precoPromo:
        d.product && promoAtiva(d.product.promoPrice, d.product.promoStartsAt, d.product.promoEndsAt, agora)
          ? Number(d.product.promoPrice)
          : null,
    }));
}

/**
 * Blocos da seção Sobre, já ordenados.
 *
 * O índice na lista é o que decide o lado da imagem no layout alternado.
 * O admin controla a ordem, nunca a lateralidade.
 */
export async function buscarBlocosSobre() {
  const blocos = await prisma.contentBlock.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
    include: { media: true },
  });

  return blocos.map((b) => ({
    id: b.id,
    titulo: b.title,
    corpo: b.body,
    imagem: imagem(b.media),
  }));
}

export async function buscarEncomenda() {
  const secao = await prisma.orderSection.findUnique({ where: { id: "singleton" } });
  if (!secao || !secao.active) return null;

  // Monta o link do WhatsApp a partir do número puro guardado no banco.
  const numero = secao.whatsappNumber?.replace(/\D/g, "") ?? "";

  return {
    titulo: secao.title,
    descricao: secao.description,
    whatsapp: numero ? `https://wa.me/${numero}` : null,
  };
}

export async function buscarRodape() {
  const [config, redes, canais, horarios, excecoes] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }),
    prisma.socialLink.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.orderChannel.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
    prisma.businessHours.findMany({ orderBy: [{ dayOfWeek: "asc" }, { periodOrder: "asc" }] }),
    prisma.specialHours.findMany(),
  ]);

  return {
    config,
    redes: redes.map((r) => ({ nome: r.platform, url: r.url })),
    canais: canais.map((c) => ({ nome: c.name, url: c.urlOrPhone, tipo: c.type })),
    horarios: horarios.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      opensAt: h.opensAt,
      closesAt: h.closesAt,
      closed: h.closed,
    })),
    excecoes: excecoes.map((e) => ({
      // `date` é @db.Date, então a parte de data já basta e não sofre com fuso.
      data: e.date.toISOString().slice(0, 10),
      opensAt: e.opensAt,
      closesAt: e.closesAt,
      closed: e.closed,
      label: e.label,
    })),
  };
}

/** Quais seções da home estão visíveis, já na ordem que o admin definiu. */
export async function buscarSecoes() {
  const secoes = await prisma.siteSection.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
  return secoes.map((s) => s.key);
}

