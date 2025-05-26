import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { Isubject } from "./subject.interface";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";

const createSubject = async (subjectData: Isubject) => {
  const classExist = await prisma.class.findUnique({
    where: {
      id: subjectData.classId,
    },
  });

  if (!classExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Class not found");
  }

  const subject = await prisma.subject.create({
    data: {
      classId: subjectData.classId,
      subjectName: subjectData.subjectName,
      subjectDescription: subjectData.subjectDescription,
      banner: subjectData.banner,
    },
  });

  return subject;
};

const getAllSubjects = async () => {
  const subject = await prisma.subject.findMany();

  return { subject };
};

const classWiseSubject = async (classId: string) => {
  const subject = await prisma.subject.findMany({
    where: {
      classId: classId,
    },
  });

  

  return { subject };
};

const updatevisibility = async (subjectId: string, isVisible: boolean) => {
  const subject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }

  const updatevisibility = await prisma.subject.update({
    where: {
      id: subject.id,
    },
    data: {
      isVisible: isVisible,
    },
  });

  return updatevisibility;
};

const subjectWiseChapter = async (
  subjectId: string,
  filters: {
    searchTerm?: string;
  },
  options: IPaginationOptions
) => {
  const { searchTerm } = filters;
  const { page, skip, limit, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(options);

  // Check if the subject exists
  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    select:{
      id: true,
      subjectName: true,
      subjectDescription: true,
      banner: true
    }
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }

  // Construct filter conditions for Chapter
  const whereConditions: Prisma.ChapterWhereInput = {
    AND: [
      { subjectId },
      ...(searchTerm
        ? [
            {
              OR: ["title", "category"].map((field) => ({
                [field]: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              })),
            },
          ]
        : []),
    ],
  };

  // Get filtered chapters
  const chapters = await prisma.chapter.findMany({
    where: whereConditions,
    select:{
      id: true,
      sLNumber: true,
      chapterName: true,
      chapterDescription: true,
      thumbnail: true
    },
    skip,
    take: limit,
    // orderBy: {
    //   [sortBy || "createdAt"]: sortOrder || "asc",
    // },
  });

  const total = await prisma.chapter.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: { subject, chapters },
  };
};

export const SubjectService = {
  createSubject,
  updatevisibility,
  getAllSubjects,
  subjectWiseChapter,
  classWiseSubject
};
