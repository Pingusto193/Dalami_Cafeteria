import "server-only";
import { prisma } from "@/lib/prisma";

/** As imagens já enviadas, para o painel deixar reaproveitar em vez de subir de novo. */
export async function imagensDisponiveis() {
  const midias = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
  });
  return midias.map((m) => ({ id: m.id, url: m.url, alt: m.altText }));
}
