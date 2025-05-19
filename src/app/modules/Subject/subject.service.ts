import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import stripe from "../../../helpars/stripe/stripe";
import prisma from "../../../shared/prisma";
import { UserRole } from "@prisma/client";
import { Isubject } from "./subject.interface";

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

  return subject;
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

const subjectWiseChapter = async (subjectId: string) => {
  const subject = await prisma.subject.findUnique({
    where: {
      id: subjectId,
    },
  });

  if (!subject) {
    throw new ApiError(httpStatus.NOT_FOUND, "Subject not found");
  }

  const chapters = await prisma.chapter.findMany({
    where: {
      subjectId: subject.id,
    },
  });

  return { chapters };
};

export const SubjectService = {
  createSubject,
  updatevisibility,
  getAllSubjects,
  subjectWiseChapter,
};
