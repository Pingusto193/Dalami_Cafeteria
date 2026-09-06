-- Travas de integridade que o Prisma não expressa no schema.
--
-- São a última camada de defesa. O Zod valida no servidor e a interface do
-- admin nem oferece o caminho inválido, mas só o banco impede que um bug
-- futuro, uma migração de dados ou um script distraído gravem lixo.

-- ---------------------------------------------------------------------------
-- Destaque: aponta para um produto OU carrega conteúdo próprio, nunca os dois.
-- ---------------------------------------------------------------------------
ALTER TABLE "Highlight"
  ADD CONSTRAINT "Highlight_produto_ou_conteudo" CHECK (
    (
      "kind" = 'product'
      AND "productId" IS NOT NULL
      AND "customTitle"   IS NULL
      AND "customText"    IS NULL
      AND "customLinkUrl" IS NULL
    )
    OR (
      "kind" = 'custom_image'
      AND "productId" IS NULL
      AND "mediaId"   IS NOT NULL
    )
    OR (
      "kind" = 'custom_content'
      AND "productId" IS NULL
      AND ("customTitle" IS NOT NULL OR "customText" IS NOT NULL)
    )
  );

ALTER TABLE "Highlight"
  ADD CONSTRAINT "Highlight_periodo_valido" CHECK (
    "startsAt" IS NULL OR "endsAt" IS NULL OR "startsAt" < "endsAt"
  );

-- ---------------------------------------------------------------------------
-- Produto: dinheiro não pode ser negativo, e promoção precisa ser desconto.
-- ---------------------------------------------------------------------------
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_preco_nao_negativo" CHECK (
    "price" >= 0 AND ("promoPrice" IS NULL OR "promoPrice" >= 0)
  );

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_promo_menor_que_preco" CHECK (
    "promoPrice" IS NULL OR "promoPrice" < "price"
  );

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_promo_periodo_valido" CHECK (
    "promoStartsAt" IS NULL
    OR "promoEndsAt" IS NULL
    OR "promoStartsAt" < "promoEndsAt"
  );

-- ---------------------------------------------------------------------------
-- Horários
-- ---------------------------------------------------------------------------
ALTER TABLE "BusinessHours"
  ADD CONSTRAINT "BusinessHours_dia_valido" CHECK (
    "dayOfWeek" >= 0 AND "dayOfWeek" <= 6
  );

-- Um dia ou está fechado, ou tem abertura e fechamento preenchidos.
ALTER TABLE "BusinessHours"
  ADD CONSTRAINT "BusinessHours_periodo_coerente" CHECK (
    "closed" = true
    OR ("opensAt" IS NOT NULL AND "closesAt" IS NOT NULL)
  );

-- ---------------------------------------------------------------------------
-- Singletons: uma linha e só uma, com id fixo.
-- ---------------------------------------------------------------------------
ALTER TABLE "SiteSettings"
  ADD CONSTRAINT "SiteSettings_singleton" CHECK ("id" = 'singleton');

ALTER TABLE "OrderSection"
  ADD CONSTRAINT "OrderSection_singleton" CHECK ("id" = 'singleton');

-- ---------------------------------------------------------------------------
-- Seções da home: só as sete chaves que o código sabe desenhar.
-- Impede que uma chave inventada apareça e não renderize nada.
-- ---------------------------------------------------------------------------
ALTER TABLE "SiteSection"
  ADD CONSTRAINT "SiteSection_chave_conhecida" CHECK (
    "key" IN ('highlights', 'menu-cta', 'order-cta', 'about', 'location', 'hours', 'contact')
  );
