import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IChapter } from "./chapter.interface";


const createchapter = async (chapterData: IChapter) => {
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


const getAllChapter = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions,
  subjectId: string
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

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
    skip,
    take: limit,
    orderBy:
      sortBy && sortOrder
        ? { [sortBy]: sortOrder }
        : {
            createdAt: "desc",
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
    getAllChapter
}