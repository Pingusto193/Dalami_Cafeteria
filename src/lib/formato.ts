/**
 * Tipos de view e formatadores.
 *
 * Este arquivo NÃO importa o Prisma de propósito. Componentes de cliente
 * precisam dos tipos e do formatador de preço, e se eles viessem de
 * `consultas.ts` o bundler arrastaria o driver `pg` inteiro para o navegador.
 */

export type ImagemView = {
  url: string;
  alt: string;
  largura: number;
  altura: number;
};

export type ProdutoView = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  preco: number;
  precoPromo: number | null;
  destaque: boolean;
  disponivel: boolean;
  imagem: ImagemView | null;
};

export type CategoriaView = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  produtos: ProdutoView[];
};

export type DestaqueView = {
  id: string;
  titulo: string | null;
  texto: string | null;
  link: string | null;
  slug: string | null;
  imagem: ImagemView | null;
  preco: number | null;
  precoPromo: number | null;
};

export function formatarPreco(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
