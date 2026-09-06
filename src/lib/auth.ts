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
export async function credenciaisConferem(
  usuario: string,
  senha: string,
  chaveLimite: string,
): Promise<boolean> {
  const usuarioEsperado = process.env.ADMIN_USERNAME;
  const hash = process.env.ADMIN_PASSWORD_HASH;

  if (!usuarioEsperado || !hash) {
    throw new Error(
      "ADMIN_USERNAME ou ADMIN_PASSWORD_HASH não estão definidos no arquivo .env. " +
        'Rode no terminal: npm run admin:senha "sua senha"',
    );
  }

  // Um hash bcrypt sempre começa com $2 e tem 60 caracteres. Se o que está no
  // .env não tem essa cara, alguém escreveu a senha em texto puro ali, o que é
  // o engano mais fácil de cometer: o campo se chama HASH mas parece um lugar
  // para digitar a senha.
  //
  // Sem esta checagem o login responderia "usuário ou senha incorretos", que é
  // mentira: a senha pode estar certa e o problema ser a configuração. Errar a
  // mensagem aqui manda a pessoa procurar no lugar errado por horas.
  if (!/^\$2[aby]\$\d{2}\$.{53}$/.test(hash)) {
    throw new Error(
      "A senha no arquivo .env não está no formato certo (ela precisa estar " +
        "embaralhada, não em texto puro). Rode no terminal: " +
        'npm run admin:senha "sua senha" e reinicie o servidor.',
    );
  }

  const usuarioOk = usuario === usuarioEsperado;
  const senhaOk = await bcrypt.compare(senha, hash);

  if (usuarioOk && senhaOk) {
    limparTentativas(chaveLimite);
    return true;
  }

  registrarFalha(chaveLimite);
  return false;
}
