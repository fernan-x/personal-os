-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ssoId" TEXT,
ADD COLUMN     "ssoProvider" TEXT,
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_ssoProvider_ssoId_key" ON "users"("ssoProvider", "ssoId");
