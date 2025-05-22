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
            id: chapterId
        }
    })

    if(!chapter){
        throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found")
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

export const StepService = {
  createStepOne,
};
