import { prisma } from "@/lib/prisma";

/**
 * Dados estruturados: o texto invisível que explica ao Google o que é este site.
 *
 * Sem isto, a Dalami é só mais um link azul na lista de resultados. Com isto, o
 * Google pode mostrar o cartão da confeitaria com foto, endereço, horário e o
 * aviso de "aberto agora" quando alguém busca "confeitaria perto de mim".
 *
 * Tudo aqui sai do banco, então acompanha o que o dono edita no painel. Um
 * horário trocado no painel é um horário trocado no Google, sem ninguém mexer
 * em código.
 *
 * O formato é o schema.org/Bakery, que é o tipo que o Google entende para
 * confeitaria e padaria.
 */

/** O Google espera "Mo", "Tu"... na ordem que ele define, não a nossa. */
const DIA_PARA_GOOGLE = [
  "Su",
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
] as const;

export async function DadosDoGoogle() {
  const [config, horarios, redes, encomenda] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { seoImageMedia: true, logoMedia: true },
    }),
    prisma.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.socialLink.findMany({ where: { active: true } }),
    prisma.orderSection.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!config) return null;

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const absoluta = (url: string | undefined) =>
    url ? (url.startsWith("http") ? url : `${site}${url}`) : undefined;

  const dados: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: config.siteName,
    description: config.seoDescription ?? undefined,
    url: site || undefined,
    image: absoluta(config.seoImageMedia?.url),
    logo: absoluta(config.logoMedia?.url),

    // A moeda importa: sem ela o Google pode mostrar o preço como dólar.
    currenciesAccepted: "BRL",
    priceRange: "$$",

    address: config.addressFull
      ? {
          "@type": "PostalAddress",
          streetAddress: config.addressFull,
          addressLocality: "Florianópolis",
          addressRegion: "SC",
          addressCountry: "BR",
        }
      : undefined,

    // Só os dias abertos entram. Listar um dia fechado com horário vazio faz
    // o Google mostrar horário errado.
    openingHoursSpecification: horarios
      .filter((h) => !h.closed && h.opensAt && h.closesAt)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DIA_PARA_GOOGLE[h.dayOfWeek],
        opens: h.opensAt,
        closes: h.closesAt,
      })),

    sameAs: redes.map((r) => r.url),

    telephone: encomenda?.whatsappNumber ? `+${encomenda.whatsappNumber}` : undefined,
  };

  // Tira as chaves vazias: o Google reclama de campo declarado sem valor.
  for (const [k, v] of Object.entries(dados)) {
    if (v === undefined || (Array.isArray(v) && v.length === 0)) delete dados[k];
  }

  return (
    <script
      type="application/ld+json"
      // Conteúdo próprio, montado a partir do banco, não texto de visitante.
      // O JSON.stringify já escapa aspas e barras.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(dados) }}
    />
  );
}
