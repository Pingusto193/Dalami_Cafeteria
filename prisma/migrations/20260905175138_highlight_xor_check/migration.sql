-- Garante no BANCO a regra "um destaque aponta para um Product OU carrega
-- conteúdo próprio, nunca os dois".
--
-- Esta é a terceira camada de defesa: o Zod valida no servidor e o enum `kind`
-- expressa a intenção, mas só o banco impede que um bug futuro (ou um script
-- de seed distraído) grave uma linha inconsistente.
--
-- Regra por tipo:
--   kind = 'product'        -> productId obrigatório; campos custom todos nulos
--   kind = 'custom_image'   -> productId nulo; mediaId obrigatório
--   kind = 'custom_content' -> productId nulo; precisa de ao menos um campo custom

ALTER TABLE "Highlight"
  ADD CONSTRAINT "Highlight_product_xor_custom" CHECK (
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
      AND (
        "customTitle"   IS NOT NULL
        OR "customText" IS NOT NULL
      )
    )
  );

-- Um período de exibição só é válido se começar antes de terminar.
ALTER TABLE "Highlight"
  ADD CONSTRAINT "Highlight_periodo_valido" CHECK (
    "startsAt" IS NULL OR "endsAt" IS NULL OR "startsAt" < "endsAt"
  );

-- Promoção: preço promocional precisa ser menor que o preço cheio, e o período
-- promocional precisa fazer sentido cronologicamente.
ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_promo_menor_que_preco" CHECK (
    "promoPrice" IS NULL OR "promoPrice" < "price"
  );

ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_preco_nao_negativo" CHECK (
    "price" >= 0 AND ("promoPrice" IS NULL OR "promoPrice" >= 0)
  );

ALTER TABLE "ProductVariant"
  ADD CONSTRAINT "ProductVariant_promo_periodo_valido" CHECK (
    "promoStartsAt" IS NULL
    OR "promoEndsAt" IS NULL
    OR "promoStartsAt" < "promoEndsAt"
  );

-- Horários: dia da semana é 0 (domingo) a 6 (sábado).
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

-- SiteSettings é singleton: exatamente uma linha, com id fixo.
ALTER TABLE "SiteSettings"
  ADD CONSTRAINT "SiteSettings_singleton" CHECK ("id" = 'singleton');
