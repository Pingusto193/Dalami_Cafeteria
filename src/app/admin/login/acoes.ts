"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bloqueadoPorTentativas, credenciaisConferem, criarSessao } from "@/lib/auth";

export type EstadoLogin = { erro: string | null };

const Entrada = z.object({
  usuario: z.string().trim().min(1, "Digite o usuário."),
  senha: z.string().min(1, "Digite a senha."),
  voltar: z.string().optional(),
});

/** Identifica quem está tentando, para o limite de tentativas. */
async function chaveDoVisitante() {
  const h = await headers();
  const encaminhado = h.get("x-forwarded-for");
  return encaminhado?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function entrar(
  _anterior: EstadoLogin,
  dados: FormData,
): Promise<EstadoLogin> {
  const analise = Entrada.safeParse({
    usuario: dados.get("usuario"),
    senha: dados.get("senha"),
    voltar: dados.get("voltar") ?? undefined,
  });

  if (!analise.success) {
    return { erro: analise.error.issues[0]?.message ?? "Preencha os dois campos." };
  }

  const chave = await chaveDoVisitante();

  const minutos = bloqueadoPorTentativas(chave);
  if (minutos > 0) {
    return {
      erro: `Muitas tentativas seguidas. Espere ${minutos} ${
        minutos === 1 ? "minuto" : "minutos"
      } e tente de novo.`,
    };
  }

  let ok = false;
  try {
    ok = await credenciaisConferem(analise.data.usuario, analise.data.senha, chave);
  } catch (e) {
    // Erro de configuração do servidor, não de quem está entrando.
    return { erro: e instanceof Error ? e.message : "Erro ao verificar o acesso." };
  }

  if (!ok) {
    // Mensagem única de propósito: dizer "usuário não existe" contaria a quem
    // está tentando que metade do palpite estava certa.
    return { erro: "Usuário ou senha incorretos." };
  }

  await criarSessao();

  const destino = analise.data.voltar;
  // Só aceita caminho interno do painel: um "voltar" vindo do formulário não
  // pode virar redirecionamento para fora do site.
  const seguro = destino && destino.startsWith("/admin") ? destino : "/admin";
  redirect(seguro);
}
