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

    if (previousStep) {
      const prevSerial = parseInt(previousStep.stepSerial);
      const currentSerial = parseInt(progressData.stepSerial);

      if (currentSerial - prevSerial !== 1) {
        throw new Error(
          "You must complete the previous step before accessing this one."
        );
      }
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
        createStep,
      };
    }

    const createStep = await prisma.userStepProgress.create({
      data: {
        stepSerial: "1",
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

const completeStepEightProgress = async (progressData: ICourseProgress) => {
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  if (!existingProgress) {
    return {
      message: "Chapter progress not found",
    };
  }

  const previousStep = await prisma.userStepProgress.findFirst({
    where: {
      userChapterProgressId: existingProgress.id,
    },
    orderBy: {
      stepSerial: "desc",
    },
  });

  if (previousStep) {
    const prevSerial = parseInt(previousStep.stepSerial);
    const currentSerial = parseInt(progressData.stepSerial);

    if (currentSerial - prevSerial !== 1) {
      throw new Error(
        "You must complete the previous step before accessing this one."
      );
    }
    const stepNumber = previousStep
      ? (parseInt(previousStep.stepSerial) + 1).toString()
      : "1";

    const createStep = await prisma.userStepProgress.create({
      data: {
        stepSerial: stepNumber,
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
        isCompleted: false,
      },
    });

    const chapterStepEightQuizCount = await prisma.stepEight.count({
      where: {
        chapterId: progressData.chapterId,
        id: progressData.stepId
      },
    });

    if (!chapterStepEightQuizCount) {
      throw new ApiError(httpStatus.NOT_FOUND, "Step eight not found");
    }

    const completedQuizCount = await prisma.completedQuiz.count({
      where: {
        chapterId: progressData.chapterId,
        stepEightId: progressData.stepId,
        userId: progressData.userId
      },
    });

    if(chapterStepEightQuizCount !== completedQuizCount ){
      throw new ApiError(httpStatus.CONFLICT, "Please compple quiz first");
    }

    return {
      createStep,
    };
  }
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

  if (isStepCompleted?.stepSerial === "10") {
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

const studentProgress = async (userId: string, stepId: string) => {
  const student = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
  }

  const step = await prisma.userStepProgress.findFirst({
    where: {
      stepId,
    },
  });

  if (!step) {
    return {
      isCompleted: false,
    };
  }

  const visible = await prisma.userStepProgress.findFirst({
    where: {
      stepId,
    },
    select: {
      isCompleted: true,
    },
  });

  return visible;
};

export const CourseProgressService = {
  createProgress,
  completeStepEightProgress,
  createNextProgress,
  studentProgress,
};
