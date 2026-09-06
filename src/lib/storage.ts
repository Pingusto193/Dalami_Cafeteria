import "server-only";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

/**
 * Onde os arquivos de imagem vivem.
 *
 * O banco NUNCA guarda o binário. A tabela Media guarda só metadados leves, e
 * o arquivo pesado fica aqui, atrás desta interface.
 *
 * Hoje existe um adaptador só, o de disco local, que serve para desenvolver.
 * ATENÇÃO: ele NÃO serve para produção no Render, cujo sistema de arquivos é
 * efêmero no plano gratuito, ou seja, tudo que foi enviado some a cada
 * redeploy. Quando as credenciais do Cloudinary existirem, basta escrever um
 * `AdaptadorCloudinary` com estes mesmos dois métodos e trocar a escolha no
 * fim do arquivo. Nada mais no projeto muda.
 */

export type ArquivoSalvo = {
  url: string;
  largura: number;
  altura: number;
  /** Tamanho do arquivo JÁ OTIMIZADO, nunca do original enviado. */
  bytes: number;
};

export interface Storage {
  salvar(dados: Buffer, nomeOriginal: string): Promise<ArquivoSalvo>;
  apagar(url: string): Promise<void>;
}

/** Teto absoluto do que o servidor aceita receber, antes de processar. */
export const LIMITE_BYTES = 10 * 1024 * 1024;

/** Maior lado da imagem depois de processada. */
const LADO_MAXIMO = 1600;

const TIPOS = {
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
  webp: [0x52, 0x49, 0x46, 0x46], // "RIFF", com "WEBP" no offset 8
} as const;

/**
 * Confere o tipo pelos PRIMEIROS BYTES, não pela extensão nem pelo campo
 * `type` do formulário. Os dois últimos são texto que quem envia escolhe, e
 * um .exe renomeado para .jpg passaria por eles sem esforço.
 */
export function tipoDeImagemValido(dados: Buffer): boolean {
  const comeca = (assinatura: readonly number[]) =>
    assinatura.every((b, i) => dados[i] === b);

  if (comeca(TIPOS.jpeg)) return true;
  if (comeca(TIPOS.png)) return true;
  if (comeca(TIPOS.webp) && dados.subarray(8, 12).toString("ascii") === "WEBP") return true;
  return false;
}

/**
 * Reprocessa a imagem no servidor.
 *
 * Faz três coisas de uma vez: limita o tamanho, converte para WebP (que pesa
 * bem menos que JPEG na mesma qualidade), e joga fora TODOS os metadados.
 * Esse último ponto importa mais do que parece: foto tirada de celular carrega
 * a coordenada de GPS de onde foi tirada, e publicar isso junto seria expor o
 * endereço de quem fotografou.
 */
async function processar(entrada: Buffer) {
  const imagem = sharp(entrada, { failOn: "error" }).rotate(); // rotate() aplica a orientação do EXIF antes de descartá-lo

  const meta = await imagem.metadata();
  const precisaEncolher =
    (meta.width ?? 0) > LADO_MAXIMO || (meta.height ?? 0) > LADO_MAXIMO;

  const saida = precisaEncolher
    ? imagem.resize(LADO_MAXIMO, LADO_MAXIMO, { fit: "inside", withoutEnlargement: true })
    : imagem;

  const buffer = await saida.webp({ quality: 82 }).toBuffer({ resolveWithObject: true });

  return {
    dados: buffer.data,
    largura: buffer.info.width,
    altura: buffer.info.height,
    bytes: buffer.data.length,
  };
}

// ---------------------------------------------------------------------------
// Adaptador de disco local (desenvolvimento)
// ---------------------------------------------------------------------------

const PASTA = path.join(process.cwd(), "public", "uploads");

class DiscoLocal implements Storage {
  async salvar(dados: Buffer, _nomeOriginal: string): Promise<ArquivoSalvo> {
    const processada = await processar(dados);

    await mkdir(PASTA, { recursive: true });

    // Nome sorteado: o nome do arquivo enviado pode conter caminho, acento ou
    // caractere que o sistema de arquivos não aceita.
    const nome = `${randomUUID()}.webp`;
    await writeFile(path.join(PASTA, nome), processada.dados);

    return {
      url: `/uploads/${nome}`,
      largura: processada.largura,
      altura: processada.altura,
      bytes: processada.bytes,
    };
  }

  async apagar(url: string): Promise<void> {
    // Só apaga o que este adaptador criou. Uma url de outro lugar (as fotos de
    // exemplo em /seed, por exemplo) é ignorada de propósito.
    if (!url.startsWith("/uploads/")) return;

    const nome = path.basename(url);
    try {
      await unlink(path.join(PASTA, nome));
    } catch {
      // Arquivo já não existe. O objetivo era esse mesmo.
    }
  }
}

export const storage: Storage = new DiscoLocal();
