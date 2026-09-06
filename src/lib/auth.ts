import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { COOKIE_SESSAO, DURACAO_DIAS, assinarSessao, tokenValido } from "@/lib/sessao";

/**
 * Autenticação do painel.
 *
 * Existe UM administrador só, e ele não mora no banco. Usuário e hash da senha
 * ficam em variáveis de ambiente do servidor. Não há tabela de usuários, não
 * há cadastro e não há recuperação de senha: trocar a senha é rodar
 * `npm run admin:senha "nova senha"` e reiniciar o servidor.
 *
 * O cookie de sessão não carrega segredo nenhum, só a marca de que alguém
 * passou pelo login. A assinatura é o que impede forjar isso.
 */

export { COOKIE_SESSAO };

export async function criarSessao() {
  const jar = await cookies();
  jar.set(COOKIE_SESSAO, await assinarSessao(), {
    httpOnly: true, // o JavaScript da página nunca lê este cookie
    secure: process.env.NODE_ENV === "production", // em dev o localhost é http
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_DIAS * 24 * 60 * 60,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE_SESSAO);
}

export async function estaLogado(): Promise<boolean> {
  const jar = await cookies();
  return tokenValido(jar.get(COOKIE_SESSAO)?.value);
}

/**
 * Trava que TODA ação de escrita do painel precisa chamar.
 *
 * O middleware já barra a navegação para /admin, mas middleware protege
 * páginas, não Server Actions: uma action é um endpoint próprio e pode ser
 * chamada direto, sem passar por página nenhuma. Esta função é a defesa que
 * importa de verdade.
 */
export async function exigirAdmin() {
  if (!(await estaLogado())) {
    throw new Error("Sua sessão expirou. Entre de novo para continuar.");
  }
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Limite de tentativas, guardado em memória.
 *
 * Limitação honesta: isto vale para UMA instância do servidor e some quando o
 * processo reinicia. No Render gratuito o serviço dorme e acorda, então o
 * contador zera junto. Para um painel de um administrador só isso segura o
 * caso real, que é alguém tentando adivinhar a senha na mão. Se um dia o
 * projeto crescer para várias instâncias, isto precisa virar Redis.
 */
const tentativas = new Map<string, { contagem: number; ate: number }>();

const MAX_TENTATIVAS = 5;
const JANELA_MS = 15 * 60 * 1000;

export function bloqueadoPorTentativas(chave: string): number {
  const registro = tentativas.get(chave);
  if (!registro) return 0;
  if (Date.now() > registro.ate) {
    tentativas.delete(chave);
    return 0;
  }
  if (registro.contagem < MAX_TENTATIVAS) return 0;
  return Math.ceil((registro.ate - Date.now()) / 60000); // minutos que faltam
}

function registrarFalha(chave: string) {
  const agora = Date.now();
  const registro = tentativas.get(chave);
  if (!registro || agora > registro.ate) {
    tentativas.set(chave, { contagem: 1, ate: agora + JANELA_MS });
    return;
  }
  registro.contagem += 1;
  registro.ate = agora + JANELA_MS;
}

export function limparTentativas(chave: string) {
  tentativas.delete(chave);
}

/**
 * Confere usuário e senha contra as variáveis de ambiente.
 *
 * O bcrypt.compare roda mesmo quando o usuário está errado, de propósito: se
 * saíssemos cedo, o tempo de resposta diferente contaria a quem estivesse
 * testando que o nome de usuário existe.
 */
const FORMATO_BCRYPT = /^\$2[aby]\$\d{2}\$.{53}$/;

/**
 * Lê o hash da senha, aceitando os dois formatos possíveis.
 *
 * Por que dois: o carregador de .env do Next.js expande variáveis, então um
 * `$NOME` dentro do valor vira o conteúdo daquela variável. Um hash bcrypt é
 * `$2b$12$...`, cheio de cifrões, e era devorado na leitura: chegava ao
 * servidor picado, com 11 ou 32 caracteres em vez de 60. Testei aspas duplas,
 * aspas simples e cifrão escapado com barra; nenhum sobreviveu. Só base64,
 * que não tem caractere especial nenhum.
 *
 * Então no arquivo .env o hash é guardado em base64. Já num painel de
 * hospedagem (Render, por exemplo), onde a variável é digitada direto e não
 * passa por expansão, o hash cru funciona. Os dois são aceitos.
 */
function hashDoAdmin(): string {
  const bruto = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();

  if (!bruto) {
    throw new Error(
      "ADMIN_PASSWORD_HASH não está definido. " +
        'Rode no terminal: npm run admin:senha "sua senha"',
    );
  }

  // Formato cru, de ambientes que não expandem variáveis.
  if (FORMATO_BCRYPT.test(bruto)) return bruto;

  // Formato base64, usado no arquivo .env local.
  try {
    const decodificado = Buffer.from(bruto, "base64").toString("utf8");
    if (FORMATO_BCRYPT.test(decodificado)) return decodificado;
  } catch {
    // Não era base64 válido. Cai na mensagem abaixo.
  }

  // Chegar aqui quase sempre significa que a senha foi escrita em texto puro
  // no lugar do hash. Sem esta mensagem o login responderia "usuário ou senha
  // incorretos", que é mentira: a senha pode estar certa e o problema ser a
  // configuração, e aí a pessoa procura no lugar errado por horas.
  throw new Error(
    "A senha guardada não está no formato certo. Rode no terminal: " +
      'npm run admin:senha "sua senha" e reinicie o servidor.',
  );
}

export async function credenciaisConferem(
  usuario: string,
  senha: string,
  chaveLimite: string,
): Promise<boolean> {
  const usuarioEsperado = process.env.ADMIN_USERNAME;

  if (!usuarioEsperado) {
    throw new Error(
      "ADMIN_USERNAME não está definido no arquivo .env.",
    );
  }

  const hash = hashDoAdmin();

  const usuarioOk = usuario === usuarioEsperado;
  const senhaOk = await bcrypt.compare(senha, hash);

  if (usuarioOk && senhaOk) {
    limparTentativas(chaveLimite);
    return true;
  }

  registrarFalha(chaveLimite);
  return false;
}
