import bcrypt from "bcrypt";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { otpEmail } from "../../../emails/otpEmail";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "../../../helpars/emailSender/emailSender";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import { EnrollStatus, Prisma, StepType, UserRole } from "@prisma/client";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { ICourseProgress, IStepProgress } from "./courseProgress.interface";

const createChapterProgress = async (progressData: ICourseProgress) => {
  const createChapter = await prisma.userChapterProgress.create({
    data: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
      isCompleted: true,
    },
  });

  return {
    createChapter,
  };
};

const createStepProgress = async (progressData: IStepProgress) => {
  const createStep = await prisma.userStepProgress.create({
    data: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
      stepId: progressData.stepId,
      stepType: progressData.stepType as StepType,
      isCompleted: true,
    },
  });

  return {
    createStep,
  };
};

export const CourseProgressService = {
  createChapterProgress,
  createStepProgress,
};
