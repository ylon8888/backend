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

const createProgress = async (progressData: ICourseProgress) => {
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  // if Existing progress
  if (existingProgress) {
    console.log("existing Chapter");

    const existingStep = await prisma.userStepProgress.findFirst({
      where: {

        stepId: progressData.stepId,
        stepType: progressData.stepType as StepType,
      },
    });

    if (existingStep) {
      return {
        existingProgress,
        existingStep,
      };
    }

    const createStep = await prisma.userStepProgress.create({
      data: {
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
        stepType: progressData.stepType as StepType,
        isCompleted: true,
      },
    });

    return {
      existingProgress,
      createStep,
    };
  }

  const createChapter = await prisma.userChapterProgress.create({
    data: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
      isCompleted: true,
    },
  });

  const createStep = await prisma.userStepProgress.create({
    data: {
      userChapterProgressId: createChapter.id,
      stepId: progressData.stepId,
      stepType: progressData.stepType as StepType,
      isCompleted: true,
    },
  });

  return {
    createChapter,
    createStep,
  };
};

const createNextProgress = async (progressData: any) => {
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  if (!existingProgress) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter progress not found");
  }

  await prisma.userChapterProgress.update({
    where: {
      id: existingProgress.id,
    },
    data: {
      isCompleted: true,
    },
  });

  const chapter = await prisma.chapter.findUnique({
    where: {
      id: progressData.chapterId
    }
  })

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

   const nextChapter = await prisma.chapter.findFirst({
  where: {
    subjectId: chapter.subjectId,
    sLNumber: {
      gt: chapter.sLNumber,
    },
  },
  orderBy: {
    sLNumber: 'asc',
  },
});


  if (!nextChapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Next chapter not found");
  }

  const nextProgress = await prisma.userChapterProgress.create({
    data: {
      userId: progressData.userId,
      chapterId: nextChapter.id,
    },
  });

  return {
    nextProgress
  }


};

export const CourseProgressService = {
  createProgress,
  createNextProgress,
};
