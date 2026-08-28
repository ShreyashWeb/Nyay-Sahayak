-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "urgency" TEXT NOT NULL DEFAULT 'LOW',
    "categoryId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintDraft" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "draftData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComplaintDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hindiName" TEXT NOT NULL,
    "plainExplanation" TEXT NOT NULL,
    "plainExplanationHindi" TEXT NOT NULL,
    "eligibilityNotes" TEXT NOT NULL,

    CONSTRAINT "LegalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DLSAOffice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,

    CONSTRAINT "DLSAOffice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplaintTemplate" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "template" TEXT NOT NULL,

    CONSTRAINT "ComplaintTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LegalCategory_name_key" ON "LegalCategory"("name");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LegalCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintDraft" ADD CONSTRAINT "ComplaintDraft_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplaintTemplate" ADD CONSTRAINT "ComplaintTemplate_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LegalCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
