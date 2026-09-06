import { prisma } from "@/lib/prisma";

/**
 * Consultas do site público.
 *
 * Regra que atravessa este arquivo: `price` é Decimal no banco e Decimal não
 * atravessa a fronteira servidor/cliente do React. Todo preço sai daqui já
 * como número, convertido num lugar só.
 */

export type VarianteView = {
  id: string;
  label: string;
  preco: number;
  precoPromo: number | null;
  porcao: string | null;
};

export type ProdutoView = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  destaque: boolean;
  disponivel: boolean;
  imagem: { url: string; alt: string; largura: number; altura: number } | null;
  variantes: VarianteView[];
};

export type CategoriaView = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  unidade: string;
  regras: string | null;
  canal: { nome: string; url: string } | null;
  produtos: ProdutoView[];
};

/** Uma promoção só vale se o preço existir e a data de hoje estiver na janela. */
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
      preferredOrderChannel: true,
      products: {
        orderBy: { order: "asc" },
        include: {
          media: true,
          variants: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  return categorias.map((c) => ({
    id: c.id,
    nome: c.name,
    slug: c.slug,
    descricao: c.description,
    unidade: c.unitType,
    regras: c.orderingNote,
    canal:
      c.preferredOrderChannel && c.preferredOrderChannel.active
        ? { nome: c.preferredOrderChannel.name, url: c.preferredOrderChannel.urlOrPhone }
        : null,
    produtos: c.products.map((p) => ({
      id: p.id,
      nome: p.name,
      slug: p.slug,
      descricao: p.description,
      destaque: p.featured,
      disponivel: p.available,
      imagem: p.media
        ? { url: p.media.url, alt: p.media.altText, largura: p.media.width, altura: p.media.height }
        : null,
      variantes: p.variants.map((v) => ({
        id: v.id,
        label: v.label,
        preco: Number(v.price),
        precoPromo: promoAtiva(v.promoPrice, v.promoStartsAt, v.promoEndsAt, agora)
          ? Number(v.promoPrice)
          : null,
        porcao: v.servingsInfo,
      })),
    })),
  }));
}

export async function buscarDestaques() {
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
    include: {
      media: true,
      product: { include: { media: true, variants: { orderBy: { order: "asc" } } } },
    },
  });

  return destaques
    .filter((d) => d.kind !== "product" || (d.product && d.product.available))
    .map((d) => ({
      id: d.id,
      tipo: d.kind,
      titulo: d.customTitle ?? d.product?.name ?? null,
      texto: d.customText ?? d.product?.description ?? null,
      link: d.customLinkUrl,
      slug: d.product?.slug ?? null,
      imagem: (d.product?.media ?? d.media)
        ? {
            url: (d.product?.media ?? d.media)!.url,
            alt: (d.product?.media ?? d.media)!.altText,
            largura: (d.product?.media ?? d.media)!.width,
            altura: (d.product?.media ?? d.media)!.height,
          }
        : null,
      menorPreco: d.product?.variants.length
        ? Math.min(...d.product.variants.map((v) => Number(v.price)))
        : null,
    }));
}

export async function buscarConteudo(chave: string) {
  const bloco = await prisma.contentBlock.findUnique({
    where: { key: chave },
    include: { media: true },
  });

  if (!bloco || !bloco.visible) return null;

  return {
    titulo: bloco.title,
    corpo: bloco.body,
    imagem: bloco.media
      ? {
          url: bloco.media.url,
          alt: bloco.media.altText,
          largura: bloco.media.width,
          altura: bloco.media.height,
        }
      : null,
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

export function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const secoesVisiveis = async () => {
  const secoes = await prisma.siteSection.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
  return secoes.map((s) => s.key);
};
