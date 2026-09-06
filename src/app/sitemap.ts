import type { MetadataRoute } from "next";

/**
 * NEXT_PUBLIC_SITE_URL precisa estar preenchida em produção, senão o sitemap
 * sai apontando para localhost. Ela também alimenta as tags Open Graph.
 */
function base() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const url = base();
  const agora = new Date();

  return [
    { url: `${url}/`, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    { url: `${url}/cardapio`, lastModified: agora, changeFrequency: "weekly", priority: 0.8 },
    { url: `${url}/encomenda`, lastModified: agora, changeFrequency: "weekly", priority: 0.8 },
  ];
}
