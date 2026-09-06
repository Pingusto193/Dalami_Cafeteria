# Dalami Confeitaria e Cafeteria

Site institucional e painel administrativo da **Dalami Confeitaria e Cafeteria**, unidade única
no bairro Ingleses, Florianópolis/SC. Instagram: [@dalamicafeteria](https://instagram.com/dalamicafeteria).

O objetivo do projeto é o dono da cafeteria atualizar quase todo o conteúdo do site sem tocar em
código, por um painel administrativo, e **sem conseguir quebrar o layout**: a edição acontece
dentro de campos pré-definidos, nunca em HTML livre.

## Stack

| Peça | Escolha |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Banco | PostgreSQL via Prisma 7 |
| Estilo | Tailwind 4, com a paleta da marca em tokens |
| Validação | Zod em todo dado que vem do admin |
| Imagens | Serviço externo (Cloudinary). Nunca disco local, nunca binário no banco |

## Como rodar

```bash
npm install
npx prisma migrate dev     # cria as tabelas
npm run db:seed            # popula o cardápio de exemplo
npm run dev                # http://localhost:3000
```

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe o site em localhost:3000 |
| `npm run build` | build de produção |
| `npm run db:studio` | abre o Prisma Studio para ver e editar o banco |
| `npm run db:seed` | repovoa os dados de exemplo (idempotente) |
| `npm run db:migrate` | aplica mudanças de schema |

## Variáveis de ambiente

Preencha no `.env` local. Em produção, cadastre as mesmas no painel do Render.

| Variável | Para que serve |
|---|---|
| `DATABASE_URL` | conexão do Postgres |
| `ADMIN_USERNAME` | usuário único do painel |
| `ADMIN_PASSWORD_HASH` | hash da senha do admin, nunca a senha em texto puro |
| `SESSION_SECRET` | segredo que assina o cookie de sessão |
| `NEXT_PUBLIC_SITE_URL` | URL pública, usada no sitemap e nas tags Open Graph |
| `CLOUDINARY_*` | credenciais do serviço de imagem |

## Publicar no ar

O passo a passo do deploy no Render está em [DEPLOY.md](DEPLOY.md), junto com
dois avisos que importam: as fotos enviadas pelo painel somem a cada atualização
do site enquanto não houver um serviço de imagens, e o banco gratuito do Render
expira em 30 dias sem backup automático.

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/app` | rotas do site público e, depois, do painel |
| `src/components` | componentes compartilhados |
| `src/lib` | consultas ao banco, formatadores e cálculo de horário |
| `prisma` | schema, migrações e seed |
| `public/seed` | fotos de exemplo usadas pelo seed |
| `referencias` | material de origem do cliente, não é servido pelo site |

## Estado do conteúdo

O cardápio real da Dalami **ainda não foi recebido**. O que está no ar é um cardápio de exemplo
plausível (Cafés, Doces, Salgados, Combos), marcado como placeholder dentro de `prisma/seed.ts`.

Também são placeholder e precisam dos dados reais do cliente:

- número de WhatsApp da seção de encomenda
- link real do iFood
- horário de funcionamento
- endereço e região exatos
- texto institucional da seção Sobre
- arquivo do logo em alta resolução

As fotos em `public/seed` são fotografia de produto de verdade, usadas como exemplo de boa
qualidade. Elas **não representam o cardápio do cliente** e devem ser trocadas pelas fotos
próprias dele quando chegarem, pela biblioteca de mídia do painel.
