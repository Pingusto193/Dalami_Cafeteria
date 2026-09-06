-- CreateTable
CREATE TABLE "OrderSectionItem" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL DEFAULT 'singleton',
    "productId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OrderSectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderSectionItem_order_idx" ON "OrderSectionItem"("order");

-- CreateIndex
CREATE UNIQUE INDEX "OrderSectionItem_sectionId_productId_key" ON "OrderSectionItem"("sectionId", "productId");

-- AddForeignKey
ALTER TABLE "OrderSectionItem" ADD CONSTRAINT "OrderSectionItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "OrderSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderSectionItem" ADD CONSTRAINT "OrderSectionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
