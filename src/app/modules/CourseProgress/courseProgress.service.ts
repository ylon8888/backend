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
import { ICourseProgress, INextStepProgress } from "./courseProgress.interface";

const createProgress = async (progressData: ICourseProgress) => {
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  // if Existing progress
  if (existingProgress) {

    const existingStep = await prisma.userStepProgress.findFirst({
      where: {
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
      },
    });

    if (existingStep) {
      return {
        existingProgress,
        existingStep,
      };
    }

    // Now check is previous step is completed or not
    const previousStep = await prisma.userStepProgress.findFirst({
      where: {
        userChapterProgressId: existingProgress.id,
      },
      orderBy: {
        stepSerial: "desc",
      },
    });

    const stepNumber = previousStep
      ? (parseInt(previousStep.stepSerial) + 1).toString()
      : "1";

    const createStep = await prisma.userStepProgress.create({
      data: {
        stepSerial: stepNumber,
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
        isCompleted: true,
      },
    });

    return {
      existingProgress,
      createStep,
    };
  }
  return {
    existingProgress,
  };
};

const createNextProgress = async (progressData: INextStepProgress) => {
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  if (!existingProgress) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter progress not found");
  }

  const isStepCompleted = await prisma.userStepProgress.findFirst({
    where: {
      userChapterProgressId: progressData.chapterId,
      stepId: progressData.chapterId,
    },
  });

  if (isStepCompleted?.stepSerial === "9") {
    const isExistchapter = await prisma.chapter.findUnique({
      where: {
        id: progressData.chapterId,
      },
    });

    if (!isExistchapter) {
      throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
    }

    const nextChapter = await prisma.chapter.findUnique({
      where: {
        id: progressData.chapterId,
        sLNumber: {
          gt: isExistchapter?.sLNumber,
        },
      },
    });

    if (!nextChapter) {
      return "Chapter finished";
    }

    const createChapterProgress = await prisma.userChapterProgress.create({
      data: {
        userId: progressData.userId,
        chapterId: progressData.chapterId,
      },
    });

    return {
      createChapterProgress,
    };
  }

  return {
    message: "Properly complete previous chapter all steps",
  };
};

export const CourseProgressService = {
  createProgress,
  createNextProgress,
};
