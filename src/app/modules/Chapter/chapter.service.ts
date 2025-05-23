import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IChapter } from "./chapter.interface";


const createchapter = async (chapterData: IChapter) => {

  const subject = await prisma.subject.findUnique({
    where: {
      id: chapterData.subjectId
    }
  })

  if(!subject){
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }
   
    const chapter = await prisma.chapter.create({
        data: {
            subjectId: chapterData.subjectId,
            chapterName: chapterData.chapterName,
            chapterDescription: chapterData.chapterDescription,
            thumbnail: chapterData.thumbnail,
        },
    })

    return {
        chapter
    }
}


const getChapterWiseSteps = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions,
  chapterId: string
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

    if (chapterId) {
    andConditions.push({
      id: chapterId,
    });
  }

  if (searchTerm) {
    andConditions.push({
      OR: ["chapterName", "chapterDescription"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ChapterWhereInput = {
    AND: [...andConditions,  { isDeleted: false }],
  };

  const chapters = await prisma.chapter.findMany({
    where: {
      ...whereConditions,
    },
    include: {
      stepOne: true,
      stepTwo: true,
      stepThree: true,
      stepFour: true,
      stepFive: true,
      stepSix: true,
      stepSeven: true,
      stepEight: {
        include: {
          stepEightQuizzes: true,
          StepNine: true,
        },
      },
      StepNine: true,
    },
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "asc",
          },
  });

  const total = await prisma.chapter.count({
    where: {
      ...whereConditions,
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: chapters,
  };
};


export const ChapterService = {
    createchapter,
    getChapterWiseSteps
}