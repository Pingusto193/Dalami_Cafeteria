import { NextResponse } from "next/server";
import { estaLogado } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage, tipoDeImagemValido, LIMITE_BYTES } from "@/lib/storage";

/**
 * Recebe uma foto do painel.
 *
 * É um route handler e não uma Server Action porque o navegador envia o
 * arquivo por fetch, depois de já ter encolhido a imagem no canvas.
 *
 * Três camadas de defesa, nesta ordem:
 *   1. sessão válida, senão qualquer um encheria o disco do servidor
 *   2. teto de tamanho, antes de qualquer processamento
 *   3. tipo conferido pelos PRIMEIROS BYTES, não pela extensão nem pelo campo
 *      `type` do formulário, que são texto que quem envia escolhe
 *
 * O sharp então reprocessa: redimensiona, converte para WebP e descarta todos
 * os metadados, inclusive a coordenada de GPS que fotos de celular carregam.
 */
export async function POST(request: Request) {
  if (!(await estaLogado())) {
    return NextResponse.json({ erro: "Faça login de novo para enviar fotos." }, { status: 401 });
  }

  let dados: FormData;
  try {
    dados = await request.formData();
  } catch {
    return NextResponse.json({ erro: "Não consegui ler o envio." }, { status: 400 });
  }

  const arquivo = dados.get("arquivo");
  if (!(arquivo instanceof File)) {
    return NextResponse.json({ erro: "Nenhuma foto foi enviada." }, { status: 400 });
  }

  if (arquivo.size > LIMITE_BYTES) {
    return NextResponse.json(
      { erro: "Essa foto é grande demais. O limite é 10 MB." },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await arquivo.arrayBuffer());

  if (!tipoDeImagemValido(bytes)) {
    return NextResponse.json(
      { erro: "Esse arquivo não é uma imagem JPG, PNG ou WebP." },
      { status: 415 },
    );
  }

  try {
    const salvo = await storage.salvar(bytes, arquivo.name);

    const alt = String(dados.get("alt") ?? "").trim().slice(0, 160) || "Foto da Dalami";

    const media = await prisma.media.create({
      data: {
        url: salvo.url,
        altText: alt,
        width: salvo.largura,
        height: salvo.altura,
        // O tamanho gravado é o do arquivo JÁ otimizado, nunca o do original.
        // Serve para perceber se a pipeline de compressão parou de funcionar.
        sizeBytes: salvo.bytes,
        usageContext: "product",
      },
    });

    return NextResponse.json({ id: media.id, url: media.url, alt: media.altText });
  } catch {
    return NextResponse.json(
      { erro: "Não consegui processar essa foto. Tente outra." },
      { status: 500 },
    );
  }
}
