import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // O painel nunca deve aparecer em busca.
      disallow: ["/admin", "/admin/"],
    },
    sitemap: `${url}/sitemap.xml`,
  };
}
