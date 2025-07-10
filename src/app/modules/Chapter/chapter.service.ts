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
      id: chapterData.subjectId,
    },
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }

  // Count existing chapters for the subject
  const existingChapterCount = await prisma.chapter.count({
    where: {
      subjectId: chapterData.subjectId,
    },
  });

  const nextSLNumber = (existingChapterCount + 1).toString();

  const chapter = await prisma.chapter.create({
    data: {
      sLNumber: nextSLNumber,
      subjectId: chapterData.subjectId,
      chapterName: chapterData.chapterName,
      chapterDescription: chapterData.chapterDescription,
      thumbnail: chapterData.thumbnail,
    },
  });

  return {
    chapter,
  };
};

const getChapterWiseSteps = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions,
  chapterId: string,
  userId: string
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
    AND: [...andConditions, { isDeleted: false }],
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
        },
      },
      stepNine: true,
      userChapterProgress: {
        where: {
          userId: userId,
        },
        include: {
          userStepProgress: {
            select: {
              stepId: true,
              isCompleted: true,
            },
          },
        },
      },
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

  // const total = await prisma.chapter.count({
  //   where: {
  //     ...whereConditions,
  //   },
  // });

  return {
    // meta: {
    //   page,
    //   limit,
    //   total,
    // },
    chapters,
  };
};

const deleteChapter = async (chapterId: string) => {
  const chapterExist = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapterExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "chapter not found");
  }

  await prisma.chapter.update({
    where: {
      id: chapterExist.id,
    },
    data: {
      isDeleted: true,
    },
  });
};

export const ChapterService = {
  createchapter,
  getChapterWiseSteps,
  deleteChapter
};
