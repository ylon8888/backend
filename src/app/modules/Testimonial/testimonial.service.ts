import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { ITestimonial } from "./testimonial.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";

const createTestimonial = async (testimonialdata: ITestimonial) => {
   const existing = await prisma.testimonial.findUnique({
    where: { userId: testimonialdata?.userId }
  });

  if (existing) {
    return;
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      ...testimonialdata,
    },
  });

  return testimonial;
};

const getStudentTestimonial = async (id: string) => {
  const testimonial = await prisma.testimonial.findMany({
    where: {
      isdisplay: true,
      courseId: id
    },
    include: {
      user: {
        select:{
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return testimonial;
};




const getAdminTestimonial = async (
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
      OR: ["title", "category"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  const whereConditions: Prisma.TestimonialWhereInput = {
    AND: [...andConditions, ],
  };

  const blogs = await prisma.testimonial.findMany({
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

  const total = await prisma.testimonial.count({
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
    data: blogs,
  };
};

const displayTestimonial = async (id: string) => {
  const isExist = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }

  const testimonial = await prisma.testimonial.update({
    where: {
      id,
    },
    data: {
      isdisplay: true,
    },
  });

  return testimonial;
};




const deleteTestimonial = async (id: string) => {
  const isExist = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }

  await prisma.testimonial.delete({
    where: {
      id,
    },
  });
};

const singleTestimonial = async (id: string) => {
  const isExist = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Testimonial not found");
  }

  const testimonial = await prisma.testimonial.findUnique({
    where: {
      id,
    },
  });

  return testimonial;
};

export const TestimonialService = {
  createTestimonial,
  getStudentTestimonial,
  displayTestimonial,
  getAdminTestimonial,
  deleteTestimonial,
  singleTestimonial
};
