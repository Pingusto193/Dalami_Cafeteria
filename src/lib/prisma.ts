import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Cada PrismaClient abre um pool de conexões. Em desenvolvimento o hot reload do
// Next.js reexecuta este módulo a cada alteração, então sem o cache no globalThis
// o Postgres acumula pools até recusar conexões.

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não está definida. Copie .env.example para .env e preencha a conexão do banco.",
    );
  }

  /**
   * O parâmetro `?schema=` na URL NÃO tem efeito nenhum aqui, e essa é a causa
   * de um bug real que já foi ao ar: as migrações passavam (a ferramenta de
   * migração do Prisma entende `?schema=`), mas toda consulta do site caía em
   * "tabela não existe", porque o `@prisma/adapter-pg` conecta usando o driver
   * `pg` puro, que não sabe o que é `?schema=` — não é um parâmetro real do
   * Postgres, é uma invenção só da ferramenta de migração.
   *
   * O jeito certo, documentado no próprio tipo `PrismaPgOptions` do pacote, é
   * passar o schema como segundo argumento do construtor. Com isso o Prisma
   * escreve o nome do schema direto no SQL que gera (`"dalami"."Category"`),
   * então funciona sempre, sem depender de nenhum comportamento do banco.
   *
   * Continuamos lendo o schema DA URL só para não duplicar a configuração:
   * quem mexe no banco muda um lugar só (o `?schema=` que a migração já usa),
   * e este trecho aproveita o mesmo valor.
   */
  let schema: string | undefined;
  try {
    schema = new URL(connectionString).searchParams.get("schema") ?? undefined;
  } catch {
    throw new Error("DATABASE_URL não é uma URL válida.");
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }, schema ? { schema } : undefined),
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
