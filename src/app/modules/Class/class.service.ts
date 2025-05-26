import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IClass } from "./class.interface";

const createClass = async (classData: IClass) => {
  const classCreation = await prisma.class.create({
    data: {
      className: classData.className,
      classDescription: classData.classDescription,
    },
  });

  return { classCreation };
};

const getAllClass = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["className", "classDescription"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ClassWhereInput = {
    AND: [...andConditions, { isDeleted: false }],
  };

  const classes = await prisma.class.findMany({
    where: {
      ...whereConditions,
    },
    include: {
      subjects: {
        select: {
          _count: true,
          chapters: {
            select: {
              _count: true,
            
            }
          }
        },
      },
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

  const total = await prisma.class.count({
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
    data: classes,
  };
};

const studentAllClass = async (
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["className", "classDescription"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.ClassWhereInput = {
    AND: [...andConditions, { isDeleted: false }],
  };

  const classes = await prisma.class.findMany({
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

  const total = await prisma.class.count({
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
    data: classes,
  };
};

const getSingleClass = async (id: string) => {
  const singleClass = await prisma.class.findUnique({
    where: {
      id,
    },
    select: {
      subjects: {
        select: {
          id: true,
          subjectName: true,
          subjectDescription: true,
          banner: true,
          isVisible: true,
        },
      },
    },
  });

  return { singleClass };
};

const classVisibility = async (id: string) => {
  const isExist = await prisma.class.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Class not found");
  }

  const classVisibility = await prisma.class.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
    },
  });

  return { classVisibility };
};

export const ClassService = {
  createClass,
  getAllClass,
  getSingleClass,
  classVisibility,
  studentAllClass
};
