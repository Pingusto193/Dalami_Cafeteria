import { SignJWT, jwtVerify } from "jose";

/**
 * Assinatura e conferência do token de sessão.
 *
 * Este arquivo é de propósito puro: só `jose`, nada de `next/headers` e nada
 * de `server-only`. O middleware do Next roda no runtime Edge, onde essas
 * duas coisas não existem, e é lá que a primeira checagem acontece.
 */

export const COOKIE_SESSAO = "dalami_sessao";
export const DURACAO_DIAS = 7;

function segredo() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curta demais. Rode: npm run admin:configurar",
    );
  }
  return new TextEncoder().encode(s);
}

export async function assinarSessao(): Promise<string> {
  const agora = Math.floor(Date.now() / 1000);
  return new SignJWT({ papel: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(agora)
    .setExpirationTime(agora + DURACAO_DIAS * 24 * 60 * 60)
    .sign(segredo());
}

export async function tokenValido(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, segredo(), { algorithms: ["HS256"] });
    return payload.papel === "admin";
  } catch {
    // Assinatura errada, expirado, ou lixo. Todos dão a mesma resposta: não.
    return false;
  }
}
