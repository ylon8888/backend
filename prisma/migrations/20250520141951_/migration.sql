-- CreateTable
CREATE TABLE "podcasts" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "podcastName" TEXT NOT NULL,
    "podcastContent" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "podcasts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcasts" ADD CONSTRAINT "podcasts_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
