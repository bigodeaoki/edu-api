/*
  Warnings:

  - Added the required column `clienteDocumento` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "documento" TEXT NOT NULL,
    "tipoPessoa" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
    "clienteDocumento" TEXT NOT NULL,
    "valorTotal" REAL NOT NULL,
    "parteAValor" REAL NOT NULL,
    "parteAEntrada" REAL NOT NULL,
    "parteAQtd" INTEGER NOT NULL,
    "parteADias" INTEGER NOT NULL,
    "parteAPrimVenc" DATETIME NOT NULL,
    "parteBValor" REAL NOT NULL,
    "parteBEntrada" REAL NOT NULL,
    "parteBQtd" INTEGER NOT NULL,
    "parteBDias" INTEGER NOT NULL,
    "parteBPrimVenc" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Payment" ("clienteNome", "criadoEm", "id", "parteADias", "parteAEntrada", "parteAPrimVenc", "parteAQtd", "parteAValor", "parteBDias", "parteBEntrada", "parteBPrimVenc", "parteBQtd", "parteBValor", "userId", "valorTotal") SELECT "clienteNome", "criadoEm", "id", "parteADias", "parteAEntrada", "parteAPrimVenc", "parteAQtd", "parteAValor", "parteBDias", "parteBEntrada", "parteBPrimVenc", "parteBQtd", "parteBValor", "userId", "valorTotal" FROM "Payment";
DROP TABLE "Payment";
ALTER TABLE "new_Payment" RENAME TO "Payment";
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX "Payment_clienteId_idx" ON "Payment"("clienteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_documento_key" ON "Cliente"("documento");

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");
