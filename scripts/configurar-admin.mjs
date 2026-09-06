/**
 * Prepara o .env para o login do painel.
 *
 * Faz duas coisas, e só quando precisa:
 *
 *   1. ADMIN_PASSWORD_HASH: se o valor ali ainda for a senha em texto puro,
 *      troca pelo hash bcrypt dela. Senha em texto puro num arquivo é o tipo
 *      de coisa que vaza junto com um backup ou um print de tela.
 *
 *   2. SESSION_SECRET: se estiver vazia, gera um valor aleatório forte. É a
 *      chave que assina o cookie de sessão; sem ela qualquer um forjaria um
 *      cookie de admin.
 *
 * Rodar de novo é seguro: se o hash já estiver no lugar, nada muda.
 *
 * Este script NUNCA imprime a senha nem o hash.
 *
 *   node scripts/configurar-admin.mjs
 *   node scripts/configurar-admin.mjs "uma nova senha"
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";

const CAMINHO = ".env";

if (!existsSync(CAMINHO)) {
  console.error("Não achei o arquivo .env na raiz do projeto.");
  process.exit(1);
}

const original = readFileSync(CAMINHO, "utf8");
const linhas = original.split(/\r?\n/);

function valorDe(chave) {
  const linha = linhas.find((l) => l.trimStart().startsWith(`${chave}=`));
  if (!linha) return null;
  return linha.slice(linha.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
}

function definir(chave, valor) {
  const i = linhas.findIndex((l) => l.trimStart().startsWith(`${chave}=`));
  const nova = `${chave}="${valor}"`;
  if (i >= 0) linhas[i] = nova;
  else linhas.push(nova);
}

/** Um hash bcrypt sempre começa com $2 e tem 60 caracteres. */
function pareceHash(v) {
  return typeof v === "string" && /^\$2[aby]\$\d{2}\$/.test(v) && v.length === 60;
}

/**
 * Guarda o hash em BASE64, e isso não é firula.
 *
 * O carregador de .env do Next.js expande variáveis: um `$NOME` dentro do
 * valor vira o conteúdo daquela variável. Um hash bcrypt é `$2b$12$...`,
 * cheio de cifrões, e era devorado na leitura: chegava ao servidor picado,
 * com 11 ou 32 caracteres em vez de 60, e a senha certa nunca batia.
 *
 * Testei aspas duplas, aspas simples e cifrão escapado com barra invertida.
 * Nenhum sobreviveu. Base64 não tem caractere especial nenhum, então passa
 * inteiro. O `auth.ts` decodifica na leitura.
 */
function paraGuardar(hash) {
  return Buffer.from(hash, "utf8").toString("base64");
}

/** Reconhece o valor guardado, nos dois formatos aceitos. */
function hashGuardado(v) {
  if (pareceHash(v)) return v;
  try {
    const d = Buffer.from(v, "base64").toString("utf8");
    if (pareceHash(d)) return d;
  } catch {
    // não era base64
  }
  return null;
}

const mudancas = [];

// --- 1. Senha ---------------------------------------------------------------
const senhaNova = process.argv[2];
const atual = valorDe("ADMIN_PASSWORD_HASH");

if (senhaNova) {
  definir("ADMIN_PASSWORD_HASH", paraGuardar(bcrypt.hashSync(senhaNova, 12)));
  mudancas.push("senha trocada e guardada embaralhada");
} else if (!atual) {
  console.error(
    "ADMIN_PASSWORD_HASH está vazia. Rode de novo passando a senha:\n" +
      '  npm run admin:senha "sua senha aqui"',
  );
  process.exit(1);
} else if (hashGuardado(atual)) {
  // Já é um hash. Regrava em base64 de qualquer forma: se estiver no formato
  // cru, o carregador do Next iria comer os cifrões na próxima leitura.
  definir("ADMIN_PASSWORD_HASH", paraGuardar(hashGuardado(atual)));
  mudancas.push("senha já estava embaralhada, formato de armazenamento conferido");
} else {
  definir("ADMIN_PASSWORD_HASH", paraGuardar(bcrypt.hashSync(atual, 12)));
  mudancas.push(
    "a senha estava em texto puro e foi embaralhada " +
      "(a senha para entrar continua a mesma)",
  );
}

// --- 2. Segredo da sessão ---------------------------------------------------
const segredo = valorDe("SESSION_SECRET");
if (!segredo || segredo.length < 32) {
  definir("SESSION_SECRET", randomBytes(48).toString("base64url"));
  mudancas.push("SESSION_SECRET gerada");
} else {
  mudancas.push("SESSION_SECRET já estava definida, mantida");
}

// --- Grava, com cópia de segurança ------------------------------------------
const novo = linhas.join("\n");
if (novo !== original) {
  copyFileSync(CAMINHO, `${CAMINHO}.bak`);
  writeFileSync(CAMINHO, novo, "utf8");
}

console.log("\nPronto.\n");
for (const m of mudancas) console.log(`  - ${m}`);
if (novo !== original) console.log("\n  Cópia do arquivo anterior salva em .env.bak\n");
else console.log("\n  Nada precisou mudar.\n");
