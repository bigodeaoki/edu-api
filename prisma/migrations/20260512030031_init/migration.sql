-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "percentualComissao" REAL NOT NULL DEFAULT 0,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "clienteNome" TEXT NOT NULL,
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
    CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Installment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "parte" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "valor" REAL NOT NULL,
    "vencimento" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "pagaEm" DATETIME,
    "clienteNome" TEXT NOT NULL,
    CONSTRAINT "Installment_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parcelaId" TEXT NOT NULL,
    "valorParcela" REAL NOT NULL,
    "valorReceber" REAL NOT NULL,
    "geradoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Commission_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Commission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Commission_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Installment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Installment_paymentId_idx" ON "Installment"("paymentId");

-- CreateIndex
CREATE INDEX "Installment_status_idx" ON "Installment"("status");

-- CreateIndex
CREATE INDEX "Installment_vencimento_idx" ON "Installment"("vencimento");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_parcelaId_key" ON "Commission"("parcelaId");

-- CreateIndex
CREATE INDEX "Commission_userId_idx" ON "Commission"("userId");

-- CreateIndex
CREATE INDEX "Commission_paymentId_idx" ON "Commission"("paymentId");
