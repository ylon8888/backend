import { Prisma, StepEight } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IStepFive, IStepOne } from "./step.interface";

// const createStepOne = async (chapterId: string, stepData: IStepOne) => {
//   const chapter = await prisma.chapter.findUnique({
//     where: {
//       id: chapterId,
//     },
//   });

//   if (!chapter) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
//   }

//   const existingStep = await prisma.stepOne.findUnique({
//     where: {
//       chapterId,
//     },
//   });

//   if (existingStep) {
//     // throw new ApiError(
//     //   httpStatus.CONFLICT,
//     //   "Step four already exists for this chapter."
//     // );
//     return;
//   }

//   const step = await prisma.stepOne.create({
//     data: {
//       chapterId: chapterId,
//       stepName: stepData.stepName,
//       stepDescription: stepData.stepDescription,
//       stepVideo: stepData.stepVideo,
//     },
//   });
//   return step;
// };

const createStepOne = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepOne.upsert({
    where: {
      chapterId: chapterId, // assumes `chapterId` is a unique field in stepOne
    },
    update: {
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
    create: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
  });

  return step;
};

const createStepTwo = async (chapterId: string, stepData: any) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepTwo.upsert({
    where: {
      chapterId, // Assumes chapterId is unique in stepTwo model
    },
    update: {
      ...stepData,
    },
    create: {
      chapterId,
      ...stepData,
    },
  });

  return step;
};

const createStepThree = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepThree.upsert({
    where: {
      chapterId, // Assumes chapterId is unique in stepThree model
    },
    update: {
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
    create: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
  });

  return step;
};

const createStepFour = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const existingStep = await prisma.stepFour.findUnique({
    where: {
      chapterId,
    },
  });

  if (existingStep) {
    return;
  }

  const step = await prisma.stepFour.create({
    data: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
  });
  return step;
};

const createStepFive = async (chapterId: string, stepData: IStepFive) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepFive.upsert({
    where: {
      chapterId, // Assumes chapterId is unique in stepFive model
    },
    update: {
      stepName: stepData.stepName,
      stepVideo: stepData.stepVideo,
      questionAnswer: stepData.questionAnswer,
    },
    create: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepVideo: stepData.stepVideo,
      questionAnswer: stepData.questionAnswer,
    },
  });

  return step;
};

const createStepSix = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepSix.upsert({
    where: {
      chapterId, // Assumes chapterId is unique in stepSix model
    },
    update: {
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
    create: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
  });

  return step;
};

const createStepSeven = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepSeven.upsert({
    where: {
      chapterId,
    },
    update: {
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
    create: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
  });

  return step;
};

const createStepEight = async (chapterId: string, stepData: StepEight) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepEight.create({
    data: {
      chapterId: chapterId,
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
    },
  });
  return step;
};

const getQuizes = async (chapterId: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const quizes = await prisma.stepEight.findMany({
    where: {
      chapterId,
    },
  });

  return { quizes };
};

const getStudentQuizes = async (chapterId: string) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const quizes = await prisma.stepEight.findMany({
    where: {
      chapterId,
      isDisable: false
    },
  });

  return { quizes };
};


const disableQuize = async(quizId: string, isDisable: boolean) => {
  const quizExist = await prisma.stepEight.findUnique({
    where: {
      id: quizId,
    },
  });

  if (!quizExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Quiz not found");
  }

  const quiz = await prisma.stepEight.update({
    where: {
      id: quizExist.id
    },
    data: {
      isDisable
    }
  })

  return quiz;
}



export const StepService = {
  createStepOne,
  createStepTwo,
  createStepThree,
  createStepFour,
  createStepFive,
  createStepSix,
  createStepSeven,
  createStepEight,
  getQuizes,
  getStudentQuizes,
  disableQuize,
};
