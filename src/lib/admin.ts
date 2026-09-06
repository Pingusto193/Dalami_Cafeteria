import "server-only";
import { revalidatePath } from "next/cache";
import { exigirAdmin } from "@/lib/auth";

/** O que toda ação do painel devolve para a tela. */
export type Resultado = { ok: boolean; mensagem: string };

/**
 * Manda o site público se reconstruir.
 *
 * As páginas são estáticas e ficam em cache para carregar rápido. Sem esta
 * chamada, o dono salvaria um preço novo e continuaria vendo o antigo no
 * site, o que pareceria que o painel não funciona.
 */
export function revalidarSite() {
  revalidatePath("/", "page");
  revalidatePath("/cardapio");
  revalidatePath("/encomenda");
}

/**
 * Embrulho de toda ação de escrita do painel.
 *
 * Garante três coisas que seria fácil esquecer numa das dezenas de ações:
 * a sessão é conferida, o site é revalidado quando dá certo, e o erro vira
 * uma frase que um usuário não técnico entende em vez de um stack trace.
 */
export async function acaoDoAdmin(
  tarefa: () => Promise<void>,
  mensagemDeSucesso: string,
): Promise<Resultado> {
  try {
    await exigirAdmin();
    await tarefa();
    revalidarSite();
    return { ok: true, mensagem: mensagemDeSucesso };
  } catch (e) {
    return { ok: false, mensagem: emPortugues(e) };
  }
}

/** Traduz os erros que o banco costuma devolver para linguagem do dia a dia. */
export function emPortugues(e: unknown): string {
  const bruto = e instanceof Error ? e.message : String(e);

  if (bruto.includes("Unique constraint") || bruto.includes("duplicate key")) {
    return "Já existe um item com esse nome. Escolha outro.";
  }
  if (bruto.includes("Foreign key constraint") && bruto.includes("Product_categoryId")) {
    return "Essa categoria ainda tem itens dentro. Mova ou apague os itens antes.";
  }
  if (bruto.includes("Foreign key constraint")) {
    return "Esse item está sendo usado em outro lugar do site e não pode ser apagado agora.";
  }
  if (bruto.includes("Product_promo_menor_que_preco")) {
    return "O preço promocional precisa ser menor que o preço normal.";
  }
  if (bruto.includes("Product_preco_nao_negativo")) {
    return "O preço não pode ser negativo.";
  }
  if (bruto.includes("Highlight_produto_ou_conteudo")) {
    return "Um destaque aponta para um item do cardápio ou tem texto próprio, nunca os dois.";
  }
  if (bruto.includes("BusinessHours_periodo_coerente")) {
    return "Preencha a hora de abrir e a de fechar, ou marque o dia como fechado.";
  }
  if (bruto.includes("sessão") || bruto.includes("Sessão")) {
    return bruto;
  }

  return "Não consegui salvar. Tente de novo, e se continuar me avise.";
}

/** Converte "12,50" ou "12.50" para o formato que o banco espera. */
export function precoParaBanco(valor: FormDataEntryValue | null): string | null {
  if (valor === null) return null;
  const texto = String(valor).trim();
  if (texto === "") return null;
  const normalizado = texto.replace(/\./g, "").replace(",", ".");
  const numero = Number(normalizado);
  if (!Number.isFinite(numero)) throw new Error("preço inválido");
  return numero.toFixed(2);
}

export function texto(valor: FormDataEntryValue | null): string {
  return String(valor ?? "").trim();
}

export function textoOuNulo(valor: FormDataEntryValue | null): string | null {
  const t = texto(valor);
  return t === "" ? null : t;
}

export function ligado(valor: FormDataEntryValue | null): boolean {
  return valor === "on" || valor === "true" || valor === "1";
}

/**
 * Cria um slug a partir do nome.
 *
 * O dono nunca vê nem digita isso: é o endereço do item no site, e deixar ele
 * escrever seria mais um campo técnico para errar.
 */
export function apelidoDe(nome: string): string {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // tira os acentos que o NFD separou
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
