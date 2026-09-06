# Publicar no Render

Passo a passo para colocar o site no ar. Leia o aviso do final **antes** de
mostrar o painel ao cliente.

---

## 1. Criar o banco

No Render: **New → PostgreSQL**.

Anote duas coisas na hora que ele criar:

- a **Internal Database URL** (é a que o site usa, mais rápida e não sai da rede do Render)
- a **data de hoje**, porque o plano gratuito expira (ver o aviso no final)

## 2. Criar o site

No Render: **New → Web Service**, apontando para este repositório.

| Campo | Valor |
|---|---|
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Pre-Deploy Command | `npm run migrate:deploy` |

O `npm run build` já roda o `prisma generate` sozinho. Isso é obrigatório: o
client do Prisma é gerado, nunca versionado, então sem esse passo o build
falha com "Cannot find module ./src/generated/prisma/client".

O **Pre-Deploy Command** aplica as migrações no banco. Ele usa `migrate deploy`,
que só aplica o que falta. Nunca use `migrate dev` em produção: ele é
interativo e pode apagar dados.

## 3. Variáveis de ambiente

No Render, em **Environment**. Todas são obrigatórias.

| Variável | O que pôr |
|---|---|
| `DATABASE_URL` | a Internal Database URL do passo 1 |
| `ADMIN_USERNAME` | o mesmo do seu `.env` local |
| `ADMIN_PASSWORD_HASH` | copie o valor do seu `.env` local, inteiro |
| `SESSION_SECRET` | copie o valor do seu `.env` local |
| `NEXT_PUBLIC_SITE_URL` | o endereço final do site, ex.: `https://dalami.onrender.com` |

Sobre a senha: o valor no `.env` local está em base64 porque o carregador de
arquivo do Next.js come os cifrões de um hash bcrypt. No painel do Render não
existe esse problema, então tanto o valor em base64 quanto o hash cru
funcionam. O código aceita os dois.

**`NEXT_PUBLIC_SITE_URL` não é opcional.** Sem ela, a prévia do link no
WhatsApp sai sem foto e o sitemap aponta para `localhost`. Preencha depois que
o Render te der o endereço, e faça um novo deploy.

## 4. Popular o banco (só na primeira vez)

O banco novo nasce vazio, e um site sem categoria nenhuma fica com a home meio
oca. Duas opções:

- **Começar do zero:** entre no painel e cadastre o cardápio real. Melhor se o
  cliente já mandou os dados.
- **Subir o exemplo:** rode `npm run db:seed` apontando para o banco de
  produção (troque o `DATABASE_URL` local temporariamente). Só faça isso se for
  uma demonstração, porque são dados fictícios.

## 5. Conferir depois de subir

- [ ] O site abre no endereço do Render
- [ ] O cardápio mostra os itens
- [ ] O pontinho no canto inferior direito leva ao login
- [ ] Login funciona com seu usuário e senha
- [ ] Salvar algo no painel muda o site
- [ ] Mandar o link no WhatsApp mostra a prévia **com foto**

---

# Dois avisos que importam de verdade

## As fotos vão sumir

O disco do Render é temporário no plano gratuito. **Toda foto que o dono subir
pelo painel some no próximo deploy ou reinício do serviço**, e o item fica sem
imagem sem ninguém mexer em nada.

Isso não é bug: o código está preparado para trocar, mas falta a conta do
serviço de imagens, que só você pode criar.

O que fazer: criar uma conta gratuita no Cloudinary e me avisar. A troca é
uma peça só, o `StorageAdapter` em `src/lib/storage.ts`, e nada mais no projeto
muda. Enquanto isso não acontecer, o painel funciona mas as fotos são
descartáveis.

## O banco gratuito expira em 30 dias

O PostgreSQL gratuito do Render **expira 30 dias depois de criado**, com mais
14 dias de tolerância antes de ser apagado de vez. E **não tem backup
automático**.

- **Banco criado em:** _(anote a data aqui)_
- **Fazer backup até:** _(data de criação + 25 dias)_

Backup manual, rodado da sua máquina:

```bash
pg_dump "<External Database URL do Render>" --no-owner --no-privileges -F c -f backup-dalami.dump
```

Restaurar:

```bash
pg_restore --no-owner --no-privileges -d "<URL de destino>" backup-dalami.dump
```

Se o cliente fechar contrato, **migre para o plano pago antes desse prazo
vencer**, senão o cardápio inteiro se perde.

## Uma coisa menor, para você não se assustar

No plano gratuito o serviço **dorme depois de 15 minutos sem visita**, e a
primeira pessoa a abrir depois disso espera cerca de um minuto. É limitação
conhecida do plano, não é o site travando.
