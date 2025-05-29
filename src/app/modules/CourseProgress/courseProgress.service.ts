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
    orderBy: {
      createdAt: "desc",
    },
  });

  // if Existing progress
  if (existingProgress) {
    console.log("existing Chapter");

    const existingStep = await prisma.userStepProgress.findFirst({
      where: {
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (existingStep) {
      console.log("existing step number", existingStep.stepSerial);
      return {
        existingProgress,
        existingStep,
      };
    }

    // Now check is previous step is completed or not
    const previousStep = await prisma.userStepProgress.findFirst({
      where: {
        userChapterProgressId: existingProgress.id,
        stepSerial: {
          lt: progressData.stepSerial,
        },
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

  //  if not existing progress
  const step = await prisma.$transaction(async (TX) => {
    const createChapterProgress = await TX.userChapterProgress.create({
      data: {
        userId: progressData.userId,
        chapterId: progressData.chapterId,
        isCompleted: true,
      },
    });

    // Now check is previous step is completed or not
    const previousStep = await prisma.userStepProgress.findFirst({
      where: {
        userChapterProgressId: createChapterProgress.id,
        stepSerial: {
          lt: progressData.stepSerial,
        },
      },
      orderBy: {
        stepSerial: "desc",
      },
    });

    const stepNumber = previousStep
      ? (parseInt(previousStep.stepSerial) + 1).toString()
      : "1";

    // Create step progress
    const createStep = await TX.userStepProgress.create({
      data: {
        stepSerial: stepNumber,
        userChapterProgressId: createChapterProgress.id,
        stepId: progressData.stepId,
        isCompleted: true,
      },
    });

    return {
      createChapterProgress,
      createStep,
    };
  });

  return {
    step,
  };
};

const createNextProgress = async (progressData: any) => {
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
    orderBy:{
      createdAt: "desc"
    }
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
      id: progressData.chapterId,
    },
  });

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
      sLNumber: "asc",
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
    nextProgress,
  };
};

export const CourseProgressService = {
  createProgress,
  createNextProgress,
};
