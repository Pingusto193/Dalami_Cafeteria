import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
