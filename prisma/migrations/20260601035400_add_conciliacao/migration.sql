-- CreateTable
CREATE TABLE "Conciliacao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parcelaId" TEXT NOT NULL,
    "nossoNumero" TEXT NOT NULL,
    "seuNumero" TEXT NOT NULL,
    "pagador" TEXT NOT NULL,
    "valorPago" REAL NOT NULL,
    "dataBaixa" DATETIME,
    "vencimentoArquivo" DATETIME,
    "historico" TEXT,
    "tipoCobranca" TEXT,
    "arquivoNome" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Conciliacao_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Installment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Conciliacao_parcelaId_key" ON "Conciliacao"("parcelaId");

-- CreateIndex
CREATE UNIQUE INDEX "Conciliacao_nossoNumero_seuNumero_key" ON "Conciliacao"("nossoNumero", "seuNumero");
