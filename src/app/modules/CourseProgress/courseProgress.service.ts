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
        userId: progressData.userId,
        chapterId: progressData.chapterId,
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
        userId: progressData.userId,
        chapterId: progressData.chapterId,
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
      userId: progressData.userId,
      chapterId: progressData.chapterId,
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

const getNextChapter = async (
  userId: string,
  courseId: string,
  currentChapterId: string
) => {
  const currentChapter = await prisma.chapter.findUnique({
    where: { id: currentChapterId },
  });

  if (!currentChapter) {
    throw new Error("Current chapter not found");
  }

  // Optionally, check if the user has completed the current chapter
  const isCompleted = await prisma.userChapterProgress.findFirst({
    where: {
      userId,
      chapterId: currentChapterId,
      isCompleted: true,
    },
  });

  if (!isCompleted) {
    throw new Error("Current chapter is not completed yet");
  }

  // Find the next chapter in the same course
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

  return nextChapter;
};

export const CourseProgressService = {
  createProgress,
  getNextChapter,
};
