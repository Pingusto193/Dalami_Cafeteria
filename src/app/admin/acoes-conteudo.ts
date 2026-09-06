"use server";

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
import { storage } from "@/lib/storage";

/**
 * Ações das telas de conteúdo do painel.
 *
 * Uma regra vale para todas: o texto rico que o dono escreve NUNCA entra no
 * banco como veio. `limparTexto` deixa passar só um punhado de marcações, e é
 * o que impede que um HTML colado de qualquer lugar vire script rodando no
 * site de quem visita.
 */

/**
 * Sanitiza o texto com formatação.
 *
 * Lista de permitidos, não lista de proibidos: o que não está aqui é
 * descartado. Uma lista de proibidos sempre esquece um caso.
 */
function limparTexto(bruto: string): string {
  let s = bruto;

  // Fora tudo que executa ou carrega coisa de fora.
  s = s.replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, "");
  s = s.replace(/<(script|style|iframe|object|embed|link|meta)[^>]*>/gi, "");

  // Fora atributos de evento (onclick e parentes) e urls javascript:.
  s = s.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/javascript:/gi, "");

  // Sobram só estas marcações. O <a> mantém href, e nada mais.
  const permitidas = /^(p|br|strong|b|em|i|u|ul|ol|li|a)$/i;
  s = s.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (tag, nome: string, resto: string) => {
    if (!permitidas.test(nome)) return "";
    if (nome.toLowerCase() === "a") {
      const href = /href\s*=\s*"([^"]*)"/i.exec(resto)?.[1] ?? "";
      const seguro = /^(https?:\/\/|mailto:|\/|#)/i.test(href) ? href : "";
      return tag.startsWith("</")
        ? "</a>"
        : `<a href="${seguro}" target="_blank" rel="noopener noreferrer">`;
    }
    return tag.startsWith("</") ? `</${nome.toLowerCase()}>` : `<${nome.toLowerCase()}>`;
  });

  return s.trim();
}

/**
 * O dono escreve em texto simples, com linha em branco separando parágrafos.
 * Isso vira <p>, que é a única formatação que ele precisa acertar sozinho.
 */
function paragrafos(bruto: string): string | null {
  const limpo = limparTexto(bruto);
  if (!limpo) return null;
  if (limpo.includes("<p>")) return limpo;

  return limpo
    .split(/\n\s*\n/)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/* ==========================================================================
   DESTAQUES
   ========================================================================== */

export async function salvarDestaque(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const productId = textoOuNulo(dados.get("produto"));
    if (!productId) throw new Error("Escolha qual item do cardápio vai no destaque.");

    if (id) {
      await prisma.highlight.update({
        where: { id },
        data: { productId, active: ligado(dados.get("ativo")) },
      });
    } else {
      const ultimo = await prisma.highlight.findFirst({ orderBy: { order: "desc" } });
      await prisma.highlight.create({
        data: {
          kind: "product",
          productId,
          active: ligado(dados.get("ativo")),
          order: (ultimo?.order ?? -1) + 1,
        },
      });
    }
  }, "Destaque salvo.");
}

export async function apagarDestaque(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await prisma.highlight.delete({ where: { id: texto(dados.get("id")) } });
  }, "Destaque removido.");
}

/* ==========================================================================
   ENCOMENDA
   ========================================================================== */

export async function salvarEncomenda(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const numero = texto(dados.get("whatsapp")).replace(/\D/g, "");
    if (numero && numero.length < 10) {
      throw new Error("O número do WhatsApp parece incompleto. Use DDD e o número.");
    }

    await prisma.orderSection.upsert({
      where: { id: "singleton" },
      update: {
        title: texto(dados.get("titulo")) || "Fazer encomenda",
        description: paragrafos(texto(dados.get("descricao"))),
        whatsappNumber: numero || null,
        active: ligado(dados.get("ativa")),
      },
      create: {
        id: "singleton",
        title: texto(dados.get("titulo")) || "Fazer encomenda",
        description: paragrafos(texto(dados.get("descricao"))),
        whatsappNumber: numero || null,
        active: ligado(dados.get("ativa")),
      },
    });
  }, "Encomenda salva.");
}

/**
 * Cria ou edita um item de encomenda.
 *
 * Antes esta tela tinha uma caixa de seleção para escolher um produto que já
 * existia no cardápio. Isso obrigava a criar o item numa tela e adicioná-lo em
 * outra, o que ninguém adivinha. Agora o item nasce aqui mesmo, com foto e
 * preço, do mesmo jeito que um item do cardápio.
 *
 * Os itens vivem numa categoria desligada, então não aparecem no cardápio do
 * dia a dia, só na página de encomenda.
 */
export async function salvarItemEncomenda(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const nome = texto(dados.get("nome"));
    if (!nome) throw new Error("Dê um nome para o item.");

    const preco = precoParaBanco(dados.get("preco"));
    if (preco === null) throw new Error("Preencha o preço.");

    const campos = {
      name: nome,
      description: textoOuNulo(dados.get("descricao")),
      price: preco,
      mediaId: textoOuNulo(dados.get("imagem")),
    };

    if (id) {
      await prisma.product.update({ where: { id }, data: campos });
      return;
    }

    // A categoria das encomendas fica desligada de propósito: os itens dela
    // não entram no cardápio do dia, só na página de encomenda.
    const categoria = await prisma.category.upsert({
      where: { slug: "encomendas" },
      update: {},
      create: {
        name: "Encomendas",
        slug: "encomendas",
        description: "Feitos sob encomenda.",
        active: false,
        order: 99,
      },
    });

    const ultimoProduto = await prisma.product.findFirst({
      where: { categoryId: categoria.id },
      orderBy: { order: "desc" },
    });

    const produto = await prisma.product.create({
      data: {
        ...campos,
        categoryId: categoria.id,
        slug: await apelidoEncomendaLivre(nome),
        order: (ultimoProduto?.order ?? -1) + 1,
      },
    });

    const ultimoItem = await prisma.orderSectionItem.findFirst({
      orderBy: { order: "desc" },
    });

    await prisma.orderSectionItem.create({
      data: {
        sectionId: "singleton",
        productId: produto.id,
        order: (ultimoItem?.order ?? -1) + 1,
      },
    });
  }, "Item salvo.");
}

/** O endereço do item no site precisa ser único. O dono nunca vê isso. */
async function apelidoEncomendaLivre(nome: string): Promise<string> {
  const base = `encomenda-${apelidoDe(nome)}` || "encomenda-item";
  let tentativa = base;
  for (let i = 2; i < 50; i++) {
    const existe = await prisma.product.findUnique({ where: { slug: tentativa } });
    if (!existe) return tentativa;
    tentativa = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

export async function removerItemEncomenda(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const item = await prisma.orderSectionItem.findUnique({
      where: { id: texto(dados.get("id")) },
      include: { product: { include: { category: true } } },
    });
    if (!item) throw new Error("Item não encontrado.");

    // Se o item nasceu aqui (mora na categoria desligada de encomendas),
    // apagar da lista é apagar o item, porque ele não existe em outro lugar.
    // Um item que veio do cardápio normal só sai da lista e continua no site.
    if (item.product.category.slug === "encomendas") {
      await prisma.product.delete({ where: { id: item.productId } });
    } else {
      await prisma.orderSectionItem.delete({ where: { id: item.id } });
    }
  }, "Item removido da encomenda.");
}

/* ==========================================================================
   SOBRE
   ========================================================================== */

export async function salvarBloco(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const titulo = texto(dados.get("titulo"));

    const campos = {
      title: titulo || null,
      body: paragrafos(texto(dados.get("corpo"))),
      mediaId: textoOuNulo(dados.get("imagem")),
      visible: ligado(dados.get("visivel")),
    };

    if (id) {
      await prisma.contentBlock.update({ where: { id }, data: campos });
    } else {
      const ultimo = await prisma.contentBlock.findFirst({ orderBy: { order: "desc" } });
      const ordem = (ultimo?.order ?? -1) + 1;
      await prisma.contentBlock.create({
        data: { ...campos, key: `sobre-${apelidoDe(titulo) || Date.now()}`, order: ordem },
      });
    }
  }, "Bloco salvo.");
}

export async function apagarBloco(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await prisma.contentBlock.delete({ where: { id: texto(dados.get("id")) } });
  }, "Bloco apagado.");
}

/* ==========================================================================
   HORÁRIO
   ========================================================================== */

export async function salvarHorarios(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    for (let dia = 0; dia <= 6; dia++) {
      const fechado = ligado(dados.get(`fechado-${dia}`));
      const abre = texto(dados.get(`abre-${dia}`));
      const fecha = texto(dados.get(`fecha-${dia}`));

      if (!fechado && (!abre || !fecha)) {
        throw new Error(
          `Preencha a hora de abrir e a de fechar de ${NOMES_DIAS[dia]}, ` +
            "ou marque o dia como fechado.",
        );
      }
      if (!fechado && abre >= fecha) {
        throw new Error(`Em ${NOMES_DIAS[dia]}, a hora de fechar precisa ser depois da de abrir.`);
      }

      await prisma.businessHours.upsert({
        where: { dayOfWeek_periodOrder: { dayOfWeek: dia, periodOrder: 0 } },
        update: { closed: fechado, opensAt: fechado ? null : abre, closesAt: fechado ? null : fecha },
        create: {
          dayOfWeek: dia,
          periodOrder: 0,
          closed: fechado,
          opensAt: fechado ? null : abre,
          closesAt: fechado ? null : fecha,
        },
      });
    }
  }, "Horários salvos.");
}

const NOMES_DIAS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/* ==========================================================================
   CONTATO: redes sociais e canais de compra
   ========================================================================== */

export async function salvarRede(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const campos = {
      platform: texto(dados.get("nome")),
      url: texto(dados.get("url")),
      active: ligado(dados.get("ativa")),
    };
    if (!campos.platform || !campos.url) throw new Error("Preencha o nome e o endereço.");

    if (id) await prisma.socialLink.update({ where: { id }, data: campos });
    else {
      const ultimo = await prisma.socialLink.findFirst({ orderBy: { order: "desc" } });
      await prisma.socialLink.create({ data: { ...campos, order: (ultimo?.order ?? -1) + 1 } });
    }
  }, "Rede social salva.");
}

export async function apagarRede(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await prisma.socialLink.delete({ where: { id: texto(dados.get("id")) } });
  }, "Rede social removida.");
}

export async function salvarCanal(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = textoOuNulo(dados.get("id"));
    const campos = {
      name: texto(dados.get("nome")),
      type: apelidoDe(texto(dados.get("nome"))) || "canal",
      urlOrPhone: texto(dados.get("url")),
      active: ligado(dados.get("ativo")),
    };
    if (!campos.name || !campos.urlOrPhone) throw new Error("Preencha o nome e o endereço.");

    if (id) await prisma.orderChannel.update({ where: { id }, data: campos });
    else {
      const ultimo = await prisma.orderChannel.findFirst({ orderBy: { order: "desc" } });
      await prisma.orderChannel.create({ data: { ...campos, order: (ultimo?.order ?? -1) + 1 } });
    }
  }, "Canal de compra salvo.");
}

export async function apagarCanal(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await prisma.orderChannel.delete({ where: { id: texto(dados.get("id")) } });
  }, "Canal removido.");
}

/* ==========================================================================
   DADOS DO SITE
   ========================================================================== */

export async function salvarSite(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const campos = {
      siteName: texto(dados.get("nome")) || "Dalami Confeitaria e Cafeteria",
      footerText: textoOuNulo(dados.get("frase")),
      locationRegion: textoOuNulo(dados.get("regiao")),
      locationNote: textoOuNulo(dados.get("recado")),
      addressFull: textoOuNulo(dados.get("endereco")),
      seoTitle: textoOuNulo(dados.get("tituloBusca")),
      seoDescription: textoOuNulo(dados.get("descricaoBusca")),
      logoMediaId: textoOuNulo(dados.get("logo")),
      faviconMediaId: textoOuNulo(dados.get("favicon")),
      seoImageMediaId: textoOuNulo(dados.get("imagemCompartilhar")),
    };

    await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      update: campos,
      create: { id: "singleton", ...campos },
    });
  }, "Dados do site salvos.");
}

/** Salva a palavrinha de cima e a frase grande de uma seção da home. */
export async function salvarTextoDaSecao(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await prisma.siteSection.update({
      where: { key: texto(dados.get("chave")) },
      data: {
        eyebrow: textoOuNulo(dados.get("etiqueta")),
        heading: textoOuNulo(dados.get("titulo")),
      },
    });
  }, "Texto da seção salvo.");
}

/* ==========================================================================
   FERIADOS E FECHAMENTO PONTUAL
   ========================================================================== */

export async function salvarFeriado(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const dia = texto(dados.get("data"));
    if (!/^d{4}-d{2}-d{2}$/.test(dia)) throw new Error("Escolha a data.");

    const fechado = ligado(dados.get("fechado"));
    const abre = texto(dados.get("abre"));
    const fecha = texto(dados.get("fecha"));

    if (!fechado && (!abre || !fecha)) {
      throw new Error("Preencha a hora de abrir e a de fechar, ou marque como fechado.");
    }
    if (!fechado && abre >= fecha) {
      throw new Error("A hora de fechar precisa ser depois da de abrir.");
    }

    // Data pura, sem hora: gravada como meio-dia UTC para que nenhum fuso
    // consiga empurrar a data para o dia anterior ou seguinte.
    const data = new Date(`${dia}T12:00:00.000Z`);

    const campos = {
      closed: fechado,
      opensAt: fechado ? null : abre,
      closesAt: fechado ? null : fecha,
      label: textoOuNulo(dados.get("motivo")),
    };

    await prisma.specialHours.upsert({
      where: { date: data },
      update: campos,
      create: { date: data, ...campos },
    });
  }, "Data especial salva.");
}

export async function apagarFeriado(
  _a: Resultado | null,
  dados: FormData,
): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    await prisma.specialHours.delete({ where: { id: texto(dados.get("id")) } });
  }, "Data especial removida.");
}

/** Liga e desliga uma seção da página inicial. */
export async function alternarSecao(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const key = texto(dados.get("chave"));
    const atual = await prisma.siteSection.findUnique({ where: { key } });
    if (!atual) throw new Error("Seção não encontrada.");
    await prisma.siteSection.update({ where: { key }, data: { visible: !atual.visible } });
  }, "Seção alterada.");
}

/* ==========================================================================
   IMAGENS
   ========================================================================== */

export async function apagarImagem(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const id = texto(dados.get("id"));

    // Conta onde a imagem está em uso ANTES de apagar. As relações usam
    // SetNull, então o banco deixaria apagar e o item ficaria sem foto em
    // silêncio. Melhor avisar do que deixar o site mudar sozinho.
    const [produtos, categorias, blocos, destaques, config] = await Promise.all([
      prisma.product.count({ where: { mediaId: id } }),
      prisma.category.count({ where: { mediaId: id } }),
      prisma.contentBlock.count({ where: { mediaId: id } }),
      prisma.highlight.count({ where: { mediaId: id } }),
      prisma.siteSettings.count({
        where: {
          OR: [{ logoMediaId: id }, { faviconMediaId: id }, { seoImageMediaId: id }],
        },
      }),
    ]);

    const usos = produtos + categorias + blocos + destaques + config;
    if (usos > 0) {
      throw new Error(
        `Essa foto está sendo usada em ${usos} ${usos === 1 ? "lugar" : "lugares"} do site. ` +
          "Troque a foto nesses lugares antes de apagar.",
      );
    }

    const midia = await prisma.media.findUnique({ where: { id } });
    if (!midia) throw new Error("Foto não encontrada.");

    await prisma.media.delete({ where: { id } });
    await storage.apagar(midia.url);
  }, "Foto apagada.");
}

export async function renomearImagem(_a: Resultado | null, dados: FormData): Promise<Resultado> {
  return acaoDoAdmin(async () => {
    const alt = texto(dados.get("alt"));
    if (!alt) throw new Error("Escreva o que a foto mostra.");
    await prisma.media.update({ where: { id: texto(dados.get("id")) }, data: { altText: alt } });
  }, "Descrição salva.");
}
