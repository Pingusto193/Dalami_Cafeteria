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

  // Diagnóstico temporário: mostra no log do servidor qual host e qual schema
  // estão sendo usados de verdade, sem nunca imprimir a senha. Existe porque
  // duas tentativas seguidas de deploy caíram no schema "public" mesmo com
  // ?schema=dalami supostamente configurado no Render — a única forma de
  // saber com certeza o que o processo está recebendo é o próprio processo
  // dizer. Remover depois que o deploy estabilizar.
  try {
    const u = new URL(connectionString);
    console.log(
      `[prisma] host=${u.hostname} banco=${u.pathname.replace("/", "")} ` +
        `schema=${u.searchParams.get("schema") ?? "(nenhum na URL, banco usa o padrão)"} ` +
        `tamanho_da_url=${connectionString.length}`,
    );
  } catch {
    console.log(
      `[prisma] DATABASE_URL não é uma URL válida (tamanho: ${connectionString.length} caracteres)`,
    );
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createPrismaClient>;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
