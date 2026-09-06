import { prisma } from "@/lib/prisma";
import { imagensDisponiveis } from "@/lib/midias";
import { Titulo } from "../componentes";
import { PainelSite } from "./painel";
import { TextosDasSecoes } from "./textos";

/** O que cada seção da página inicial é, em palavras que o dono reconhece. */
const NOMES_DAS_SECOES: Record<string, { nome: string; explica: string }> = {
  highlights: { nome: "Destaques", explica: "O topo da página, com os itens girando." },
  "menu-cta": { nome: "Cardápio", explica: "Os quadros das categorias e o botão do cardápio." },
  "order-cta": { nome: "Encomenda", explica: "O bloco laranja que leva para a encomenda." },
  about: { nome: "Sobre", explica: "Os blocos de texto e foto sobre a casa." },
  location: { nome: "Onde estamos", explica: "A faixa verde com o bairro da loja." },
  hours: { nome: "Horário", explica: "A tabela de horários e o aberto/fechado." },
  contact: { nome: "Contato", explica: "Os botões de WhatsApp, iFood e redes." },
};

/** Seções cujo título grande vem do conteúdo, não de um campo próprio. */
const SEM_TITULO_PROPRIO = new Set(["highlights", "order-cta", "about", "location"]);

export default async function AdminSite() {
  const [config, secoes, imagens] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { id: "singleton" },
      include: { logoMedia: true, faviconMedia: true, seoImageMedia: true },
    }),
    prisma.siteSection.findMany({ orderBy: { order: "asc" } }),
    imagensDisponiveis(),
  ]);

  const paraImagem = (m: { id: string; url: string; altText: string } | null) =>
    m ? { id: m.id, url: m.url, alt: m.altText } : null;

  return (
    <>
      <Titulo apoio="Nome da casa, frase do rodapé, onde a loja fica, e o que aparece quando alguém compartilha o site.">
        Dados do site
      </Titulo>

      <PainelSite
        dados={{
          nome: config?.siteName ?? "",
          frase: config?.footerText ?? "",
          regiao: config?.locationRegion ?? "",
          recado: config?.locationNote ?? "",
          endereco: config?.addressFull ?? "",
          tituloBusca: config?.seoTitle ?? "",
          descricaoBusca: config?.seoDescription ?? "",
          logo: paraImagem(config?.logoMedia ?? null),
          favicon: paraImagem(config?.faviconMedia ?? null),
          imagemCompartilhar: paraImagem(config?.seoImageMedia ?? null),
        }}
        secoes={secoes.map((s) => ({
          id: s.id,
          chave: s.key,
          nome: NOMES_DAS_SECOES[s.key]?.nome ?? s.key,
          explica: NOMES_DAS_SECOES[s.key]?.explica ?? "",
          visivel: s.visible,
        }))}
        imagens={imagens}
      />

      <div className="mt-6 max-w-3xl">
        <TextosDasSecoes
          secoes={secoes.map((s) => ({
            chave: s.key,
            nome: NOMES_DAS_SECOES[s.key]?.nome ?? s.key,
            explica: NOMES_DAS_SECOES[s.key]?.explica ?? "",
            etiqueta: s.eyebrow ?? "",
            titulo: s.heading ?? "",
            temTitulo: !SEM_TITULO_PROPRIO.has(s.key),
          }))}
        />
      </div>
    </>
  );
}
