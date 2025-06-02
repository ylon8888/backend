import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { ICourseProgress, INextStepProgress } from "./courseProgress.interface";
import { log } from "console";

const createProgress = async (progressData: ICourseProgress) => {
  console.log(progressData)



  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  if (existingProgress) {
    const existingStep = await prisma.userStepProgress.findFirst({
      where: {
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
      },
    });

    if (existingStep) {
      return {
        success: true,
        message: "Step already completed",
        data: { existingProgress, existingStep },
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

    const prevSerial = previousStep ? parseInt(previousStep.stepSerial) : 0;
    const currentSerial = parseInt(progressData.stepSerial);

    if (currentSerial - prevSerial !== 1) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "You must complete the previous step before accessing this one."
      );
    }

    const stepNumber = (prevSerial + 1).toString();

    const createStep = await prisma.userStepProgress.create({
      data: {
        stepSerial: stepNumber,
        userChapterProgressId: existingProgress.id,
        stepId: progressData.stepId,
        isCompleted: true,
      },
    });

    return {
      success: true,
      message: "Step progress created",
      data: { existingProgress, createStep },
    };
  }

  return {
    success: false,
    message: "User chapter progress not found",
  };
};

const completeStepEightProgress = async (progressData: ICourseProgress) => {
  if (parseInt(progressData.stepSerial) !== 8) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid step for Step Eight logic"
    );
  }

  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  if (!existingProgress) {
    return {
      success: false,
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

  const prevSerial = previousStep ? parseInt(previousStep.stepSerial) : 0;
  const currentSerial = parseInt(progressData.stepSerial);

  if (currentSerial - prevSerial !== 1) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "You must complete the previous step before accessing this one."
    );
  }

  const stepNumber = (prevSerial + 1).toString();

  const createStep = await prisma.userStepProgress.create({
    data: {
      stepSerial: stepNumber,
      userChapterProgressId: existingProgress.id,
      stepId: progressData.stepId,
      isCompleted: true,
    },
  });

  const chapterStepEightQuizCount = await prisma.stepEight.count({
    where: {
      chapterId: progressData.chapterId,
    },
  });

  if (!chapterStepEightQuizCount) {
    throw new ApiError(httpStatus.NOT_FOUND, "Step Eight not found");
  }

  const completedQuizCount = await prisma.completedQuiz.count({
    where: {
      chapterId: progressData.chapterId,
      stepEightId: progressData.stepId,
      userId: progressData.userId,
    },
  });

  if (chapterStepEightQuizCount !== completedQuizCount) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Please complete all quizzes first"
    );
  }

  return {
    success: true,
    message: "Step Eight completed",
    data: { createStep },
  };
};

const createNextProgress = async (progressData: INextStepProgress) => {
   console.log(progressData)
  const existingProgress = await prisma.userChapterProgress.findFirst({
    where: {
      userId: progressData.userId,
      chapterId: progressData.chapterId,
    },
  });

  if (!existingProgress) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter progress not found");
  }

  const lastStep = await prisma.userStepProgress.findFirst({
    where: {
      userChapterProgressId: existingProgress.id,
    },
    orderBy: {
      stepSerial: "desc",
    },
  });

  if (!lastStep || lastStep.stepSerial !== "10") {
    return {
      success: false,
      message: "Please complete all steps in the current chapter",
    };
  }

  const currentChapter = await prisma.chapter.findUnique({
    where: {
      id: progressData.chapterId,
    },
  });

  if (!currentChapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const nextChapter = await prisma.chapter.findFirst({
    where: {
      id: currentChapter.id,
      sLNumber: {
        gt: currentChapter.sLNumber,
      },
    },
    orderBy: {
      sLNumber: "asc",
    },
  });

  if (!nextChapter) {
    return {
      success: true,
      message: "All chapters completed",
    };
  }

  const createChapterProgress = await prisma.userChapterProgress.create({
    data: {
      userId: progressData.userId,
      chapterId: nextChapter.id,
    },
  });

  return {
    success: true,
    message: "Next chapter progress created",
    data: { createChapterProgress },
  };
};

const studentProgress = async (userId: string, chapterId: string) => {
  const student = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!student) {
    throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
  }

  const step = await prisma.userChapterProgress.findMany({
    where: {
      chapterId,
      userId,
    },
    select:{
      userStepProgress:{

      }
    }
  });

  return {
    success: true,
    step
};
}


export const CourseProgressService = {
  createProgress,
  completeStepEightProgress,
  createNextProgress,
  studentProgress,
};
