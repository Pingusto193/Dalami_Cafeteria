import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Diagnóstico temporário: mostra o mesmo host/schema que src/lib/prisma.ts
// imprime, mas do lado da MIGRAÇÃO. Se este log e o do build mostrarem
// schemas diferentes, o problema é uma diferença entre os dois processos.
// Se mostrarem o mesmo "public" mesmo com ?schema=dalami configurado no
// Render, o problema está na variável de ambiente em si. Remover depois.
try {
  const bruta = env("DATABASE_URL");
  const u = new URL(bruta);
  console.log(
    `[prisma.config] host=${u.hostname} banco=${u.pathname.replace("/", "")} ` +
      `schema=${u.searchParams.get("schema") ?? "(nenhum na URL)"} ` +
      `tamanho_da_url=${bruta.length}`,
  );
} catch (e) {
  console.log(`[prisma.config] não consegui ler DATABASE_URL: ${e instanceof Error ? e.message : e}`);
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 configura o seed aqui — NÃO mais no campo "prisma.seed" do package.json.
    // Migrations também não rodam o seed automaticamente: use `npm run db:seed`.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
