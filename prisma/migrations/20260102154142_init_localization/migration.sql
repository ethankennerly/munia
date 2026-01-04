-- CreateTable
CREATE TABLE "Localization" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Localization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Localization_key_idx" ON "Localization"("key");

-- CreateIndex
CREATE INDEX "Localization_locale_idx" ON "Localization"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "Localization_key_locale_key" ON "Localization"("key", "locale");
