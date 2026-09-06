import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO, tokenValido } from "@/lib/sessao";

/**
 * Primeira barreira do painel.
 *
 * Roda no Edge, antes de qualquer página montar, e só faz uma coisa: conferir
 * a assinatura do cookie. Nada de banco e nada de bcrypt aqui, que não
 * existem nesse runtime.
 *
 * Esta é a primeira camada, não a única. Server Actions são endpoints
 * próprios e podem ser chamadas sem passar por página nenhuma, então cada uma
 * chama `exigirAdmin()` por conta. Middleware protege navegação; a action
 * protege a escrita.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(COOKIE_SESSAO)?.value;
  const logado = await tokenValido(token);

  // Já logado tentando ver o login: manda para o painel.
  if (pathname === "/admin/login") {
    if (logado) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!logado) {
    const url = new URL("/admin/login", request.url);
    // Guarda onde a pessoa queria ir, para voltar para lá depois de entrar.
    if (pathname !== "/admin") url.searchParams.set("voltar", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
