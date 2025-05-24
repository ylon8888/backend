import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import { IBlog } from "./blog.interface";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";

const createBlog = async (blogData: IBlog) => {
  return await prisma.blog.create({
    data: {
      title: blogData.title,
      excerpt: blogData.excerpt,
      description: blogData.description,
      image: blogData.image,
      category: blogData.category,
    },
  });
};

const updateBlog = async (id: string, blogData: Partial<IBlog>) => {
  const findBlog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!findBlog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: blogData,
  });

  return blog;
};

const deleteBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  await prisma.blog.update({
    where: {
      id
    },
    data:{
      isDeleted: true
    }
  })
};

const getAllBlogs = async (
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

  const whereConditions: Prisma.BlogWhereInput = {
    AND: [...andConditions, { isDeleted: false }],
  };

  const blogs = await prisma.blog.findMany({
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

  const total = await prisma.blog.count({
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

const getSingleBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  // Extract a keyword from the blog title (for basic similarity search)
  const keywords = blog.title.split(" ").filter(word => word.length > 3); // filter short/common words
  const firstKeyword = keywords[0] || blog.title; // fallback if no valid keyword

  const relatedBlog = await prisma.blog.findMany({
    where: {
      title: {
        contains: firstKeyword,
        mode: "insensitive",
      },
      NOT: {
        id,
      },
    },
    take: 3,
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    blog,
    relatedBlog,
  };
};



export const BlogService = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getSingleBlog,
};
