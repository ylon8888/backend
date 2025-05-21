-- CreateTable
CREATE TABLE "quizQuestions" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "optionA" TEXT NOT NULL,
    "optionB" TEXT NOT NULL,
    "optionC" TEXT NOT NULL,
    "optionD" TEXT NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courseReviews" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "useId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courseReviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quizQuestions_quizId_key" ON "quizQuestions"("quizId");

-- AddForeignKey
ALTER TABLE "quizQuestions" ADD CONSTRAINT "quizQuestions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseReviews" ADD CONSTRAINT "courseReviews_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courseReviews" ADD CONSTRAINT "courseReviews_useId_fkey" FOREIGN KEY ("useId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
