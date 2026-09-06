"use server";

import { prisma } from "@/lib/prisma";
import { exigirAdmin } from "@/lib/auth";
import { revalidarSite } from "@/lib/admin";

/**
 * Grava a nova ordem de uma lista arrastada.
 *
 * Recebe os ids já na ordem final e regrava o campo `order` de cada um com a
 * posição dele. Regravar tudo, em vez de trocar dois vizinhos, é o que casa
 * com arrastar: um item pode saltar cinco posições de uma vez, e aí não
 * existe "vizinho" com quem trocar.
 *
 * Tudo numa transação: se uma linha falhar, nenhuma muda. Meia reordenação
 * gravada deixaria a lista embaralhada de um jeito que o dono não pediu.
 */

type Lista =
  | "category"
  | "product"
  | "highlight"
  | "contentBlock"
  | "orderSectionItem"
  | "siteSection"
  | "socialLink"
  | "orderChannel";

export async function reordenar(lista: Lista, idsNaOrdem: string[]): Promise<boolean> {
  try {
    await exigirAdmin();

    if (idsNaOrdem.length === 0) return true;

    // Um id repetido significaria pedido malformado, e gravar assim deixaria
    // duas linhas com a mesma posição.
    if (new Set(idsNaOrdem).size !== idsNaOrdem.length) return false;

    const modelo = prisma[lista] as typeof prisma.category;

    await prisma.$transaction(
      idsNaOrdem.map((id, posicao) =>
        modelo.update({ where: { id }, data: { order: posicao } }),
      ),
    );

    revalidarSite();
    return true;
  } catch {
    return false;
  }
}
