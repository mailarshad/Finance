-- DropForeignKey
ALTER TABLE "public"."Income" DROP CONSTRAINT "Income_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."Income" ADD CONSTRAINT "Income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
