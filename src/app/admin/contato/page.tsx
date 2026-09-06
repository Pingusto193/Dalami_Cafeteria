import { prisma } from "@/lib/prisma";
import { Titulo } from "../componentes";
import { PainelContato } from "./painel";

export default async function AdminContato() {
  const [redes, canais] = await Promise.all([
    prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
    prisma.orderChannel.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <Titulo apoio="Os links que aparecem no site: redes sociais e onde a pessoa compra.">
        Contato
      </Titulo>

      <PainelContato
        redes={redes.map((r) => ({ id: r.id, nome: r.platform, url: r.url, ativa: r.active }))}
        canais={canais.map((c) => ({
          id: c.id,
          nome: c.name,
          url: c.urlOrPhone,
          ativa: c.active,
        }))}
      />
    </>
  );
}
