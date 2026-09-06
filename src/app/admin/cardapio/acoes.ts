"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  acaoDoAdmin,
  apelidoDe,
  ligado,
  precoParaBanco,
  texto,
  textoOuNulo,
  type Resultado,
} from "@/lib/admin";
import { exigirAdmin } from "@/lib/auth";
import { revalidarSite } from "@/lib/admin";

/* --------------------------------------------------------------------------
   Categorias
   -------------------------------------------------------------------------- */

export async function salvarCategoria(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const nome = texto(dados.get("nome"));
    if (!nome) throw new Error("Dê um nome para a categoria.");

    const campos = {
      name: nome,
      description: textoOuNulo(dados.get("descricao")),
      active: ligado(dados.get("ativa")),
    };

    if (id) {
      await prisma.category.update({ where: { id }, data: campos });
    } else {
      const ultima = await prisma.category.findFirst({ orderBy: { order: "desc" } });
      await prisma.category.create({
        data: { ...campos, slug: apelidoDe(nome), order: (ultima?.order ?? -1) + 1 },
      });
    }
  }, "Categoria salva.");
}

export async function apagarCategoria(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = texto(dados.get("id"));
    const quantos = await prisma.product.count({ where: { categoryId: id } });
    if (quantos > 0) {
      throw new Error(
        `Essa categoria ainda tem ${quantos} ${quantos === 1 ? "item" : "itens"} dentro. ` +
          "Apague ou mova os itens antes.",
      );
    }
    await prisma.category.delete({ where: { id } });
  }, "Categoria apagada.");
}

export async function moverCategoria(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await trocarDeLugar("category", texto(dados.get("id")), texto(dados.get("direcao")));
  }, "Ordem alterada.");
}

/* --------------------------------------------------------------------------
   Itens do cardápio
   -------------------------------------------------------------------------- */

export async function salvarProduto(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const nome = texto(dados.get("nome"));
    if (!nome) throw new Error("Dê um nome para o item.");

    const preco = precoParaBanco(dados.get("preco"));
    if (preco === null) throw new Error("Preencha o preço.");

    const promo = precoParaBanco(dados.get("precoPromo"));
    if (promo !== null && Number(promo) >= Number(preco)) {
      throw new Error("O preço promocional precisa ser menor que o preço normal.");
    }

    const campos = {
      categoryId: texto(dados.get("categoria")),
      name: nome,
      description: textoOuNulo(dados.get("descricao")),
      price: preco,
      promoPrice: promo,
      mediaId: textoOuNulo(dados.get("imagem")),
      featured: ligado(dados.get("destaque")),
      available: ligado(dados.get("disponivel")),
    };

    if (id) {
      await prisma.product.update({ where: { id }, data: campos });
    } else {
      const ultimo = await prisma.product.findFirst({
        where: { categoryId: campos.categoryId },
        orderBy: { order: "desc" },
      });
      await prisma.product.create({
        data: { ...campos, slug: await apelidoLivre(nome), order: (ultimo?.order ?? -1) + 1 },
      });
    }
  }, "Item salvo.");
}

export async function apagarProduto(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  const resultado = await acaoDoAdmin(async () => {
    await prisma.product.delete({ where: { id: texto(dados.get("id")) } });
  }, "Item apagado.");

  if (resultado.ok) redirect("/admin/cardapio");
  return resultado;
}

export async function moverProduto(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await trocarDeLugar("product", texto(dados.get("id")), texto(dados.get("direcao")));
  }, "Ordem alterada.");
}

/** Liga e desliga a disponibilidade direto da lista, sem abrir o item. */
export async function alternarDisponivel(
  _anterior: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = texto(dados.get("id"));
    const atual = await prisma.product.findUnique({ where: { id }, select: { available: true } });
    if (!atual) throw new Error("Item não encontrado.");
    await prisma.product.update({ where: { id }, data: { available: !atual.available } });
  }, "Disponibilidade alterada.");
}

/* --------------------------------------------------------------------------
   Apoio
   -------------------------------------------------------------------------- */

/**
 * O slug é o endereço do item no site e precisa ser único. Se já existir um
 * igual, acrescenta um número. O dono nunca vê isso.
 */
async function apelidoLivre(nome: string): Promise<string> {
  const base = apelidoDe(nome) || "item";
  let tentativa = base;
  for (let i = 2; i < 50; i++) {
    const existe = await prisma.product.findUnique({ where: { slug: tentativa } });
    if (!existe) return tentativa;
    tentativa = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

/**
 * Troca a posição de dois vizinhos na lista.
 *
 * Trocar os dois valores de `order` entre si, em vez de reindexar tudo, mantém
 * a operação pequena e não mexe em quem não precisa mudar.
 */
async function trocarDeLugar(
  tabela: "category" | "product",
  id: string,
  direcao: string,
) {
  const modelo = tabela === "category" ? prisma.category : prisma.product;

  const atual = await (modelo as typeof prisma.category).findUnique({ where: { id } });
  if (!atual) throw new Error("Item não encontrado.");

  const paraCima = direcao === "subir";

  // Produtos são ordenados dentro da própria categoria.
  const escopo =
    tabela === "product" && "categoryId" in atual
      ? { categoryId: (atual as { categoryId: string }).categoryId }
      : {};

  const vizinho = await (modelo as typeof prisma.category).findFirst({
    where: {
      ...escopo,
      order: paraCima ? { lt: atual.order } : { gt: atual.order },
    },
    orderBy: { order: paraCima ? "desc" : "asc" },
  });

  if (!vizinho) return; // já está na ponta

  await prisma.$transaction([
    (modelo as typeof prisma.category).update({
      where: { id: atual.id },
      data: { order: vizinho.order },
    }),
    (modelo as typeof prisma.category).update({
      where: { id: vizinho.id },
      data: { order: atual.order },
    }),
  ]);
}

/** Usada pela tela de item nova, que não passa por acaoDoAdmin. */
export async function garantirAdmin() {
  await exigirAdmin();
  revalidarSite();
}
