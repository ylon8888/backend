-- CreateTable
CREATE TABLE "topics" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,
    "topicDescription" TEXT,
    "topicVideo" TEXT NOT NULL,
    "questionAnswer" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
