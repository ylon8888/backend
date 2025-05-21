-- CreateTable
CREATE TABLE "quizes" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "quizName" TEXT NOT NULL,
    "quizDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "quizes" ADD CONSTRAINT "quizes_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
