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

const mudancas = [];

// --- 1. Senha ---------------------------------------------------------------
const senhaNova = process.argv[2];
const atual = valorDe("ADMIN_PASSWORD_HASH");

if (senhaNova) {
  definir("ADMIN_PASSWORD_HASH", bcrypt.hashSync(senhaNova, 12));
  mudancas.push("ADMIN_PASSWORD_HASH trocado pelo hash da nova senha");
} else if (!atual) {
  console.error(
    "ADMIN_PASSWORD_HASH está vazia. Rode de novo passando a senha:\n" +
      '  node scripts/configurar-admin.mjs "sua senha aqui"',
  );
  process.exit(1);
} else if (pareceHash(atual)) {
  mudancas.push("ADMIN_PASSWORD_HASH já era um hash, mantido como estava");
} else {
  definir("ADMIN_PASSWORD_HASH", bcrypt.hashSync(atual, 12));
  mudancas.push(
    "ADMIN_PASSWORD_HASH estava em texto puro e virou hash bcrypt " +
      "(a senha continua a mesma para entrar)",
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
