-- CreateTable
CREATE TABLE "FediInstance" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "clientID" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FediInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FediAccount" (
    "id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "fediInstanceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FediAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FediInstance_domain_key" ON "FediInstance"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "FediAccount_subject_key" ON "FediAccount"("subject");

-- AddForeignKey
ALTER TABLE "FediAccount" ADD CONSTRAINT "FediAccount_fediInstanceId_fkey" FOREIGN KEY ("fediInstanceId") REFERENCES "FediInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FediAccount" ADD CONSTRAINT "FediAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
