import { Prisma } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IStepOne } from "./step.interface";

const createStepOne = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const existingStep = await prisma.stepOne.findUnique({
    where: {
      chapterId,
    },
  });

  if (existingStep) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Step One already exists for this chapter."
    );
  }

  const step = await prisma.stepOne.create({
    data: {
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

  const existingStep = await prisma.stepTwo.findUnique({
    where: {
      chapterId,
    },
  });

  if (existingStep) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "StepTwo already exists for this chapter."
    );
  }

  const step = await prisma.stepTwo.create({
    data: {
      chapterId,
      ...stepData,
    },
  });

  return step;
};

export const StepService = {
  createStepOne,
  createStepTwo,
};
