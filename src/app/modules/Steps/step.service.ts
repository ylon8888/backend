import { Prisma, StepEight } from "@prisma/client";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import prisma from "../../../shared/prisma";
import httpStatus from "http-status";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { IStepEight, IStepFive, IStepOne, IStepTwo } from "./step.interface";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";

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

  const step = await prisma.stepFour.upsert({
    where: {
      chapterId, // This works because chapterId is unique
    },
    update: {
      stepName: stepData.stepName,
      stepDescription: stepData.stepDescription,
      stepVideo: stepData.stepVideo,
    },
    create: {
      chapterId,
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

const createStepEight = async (chapterId: string, stepData: IStepEight) => {
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
      questionType: stepData.questionType,
      questionDescription: stepData.questionDescription,
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
      isDisable: false,
    },
  });

  return { quizes };
};

const disableQuize = async (quizId: string, isDisable: boolean) => {
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
      id: quizExist.id,
    },
    data: {
      isDisable,
    },
  });

  return quiz;
};

// const uploadQuiz = async (quizId: string, file: Express.Multer.File) => {
//   const quizExist = await prisma.stepEight.findUnique({
//     where: { id: quizId },
//   });

//   if (!quizExist) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Quiz not found');
//   }

//   // Read the Excel file
//   const workbook = xlsx.readFile(file.path);
//   const sheetName = workbook.SheetNames[0];
//   const sheetData = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

//   // Parse and insert each row
//   const quizEntries = sheetData.map((row: any) => ({
//     stepEightId: quizId,
//     questionText: row['Question Text']?.toString().trim(),
//     optionA: row['Option A']?.toString().trim(),
//     optionB: row['Option B']?.toString().trim(),
//     optionC: row['Option C']?.toString().trim(),
//     optionD: row['Option D']?.toString().trim(),
//     correctAnswer: row['Correct Answer']?.toString().trim(),
//   }));

//   const insertedQuizzes = await prisma.stepEightQuiz.createMany({
//     data: quizEntries,
//     skipDuplicates: true,
//   });

//   fs.unlinkSync(path.resolve(file.path));

//   return insertedQuizzes;
// };

const uploadQuiz = async (quizId: string, file: Express.Multer.File) => {
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const sheetData = xlsx.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);

  // Validate StepEight exists
  const stepExists = await prisma.stepEight.findUnique({
    where: { id: quizId },
  });

  if (!stepExists) {
    fs.unlinkSync(file.path);
    throw new ApiError(httpStatus.NOT_FOUND, "Quiz not found");
  }

  // Process each row with upsert using composite unique constraint
  const transaction = await prisma.$transaction(
    sheetData.map((row) =>
      prisma.stepEightQuiz.upsert({
        where: {
          stepEightId_questionText: {
            stepEightId: quizId,
            questionText: row["Question Text"]?.toString().trim(),
          },
        },
        update: {
          optionA: row["Option A"]?.toString().trim(),
          optionB: row["Option B"]?.toString().trim(),
          optionC: row["Option C"]?.toString().trim(),
          optionD: row["Option D"]?.toString().trim(),
          correctAnswer: row["Correct Answer"]?.toString().trim(),
        },
        create: {
          stepEightId: quizId,
          questionText: row["Question Text"]?.toString().trim(),
          optionA: row["Option A"]?.toString().trim(),
          optionB: row["Option B"]?.toString().trim(),
          optionC: row["Option C"]?.toString().trim(),
          optionD: row["Option D"]?.toString().trim(),
          correctAnswer: row["Correct Answer"]?.toString().trim(),
        },
      })
    )
  );

  fs.unlinkSync(file.path);
  return transaction;
};

const createStepNine = async (chapterId: string, stepData: IStepOne) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chapter not found");
  }

  const step = await prisma.stepNine.upsert({
    where: {
      chapterId, // Assumes chapterId is unique in stepFive model
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

const getQuizQustion = async (quizId: string) => {
  const quizExist = await prisma.stepEight.findUnique({
    where: {
      id: quizId,
    },
  });

  if (!quizExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Quiz not found");
  }

  const quiz = await prisma.stepEight.findUnique({
    where: {
      id: quizExist.id,
    },
    select: {
      questionType: true,
      questionDescription: true,
      stepEightQuizzes: {
        select: {
          id: true,
          questionText: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
          correctAnswer: false,
        },
      },
    },
  });

  return quiz;
};

export interface Answer {
  quizId: string;
  selectedOption: "optionA" | "optionB" | "optionC" | "optionD";
}

export const submitQuizAnswers = async (userId: string, answers: Answer[]) => {
  const results = [];

  const session = await prisma.stepEightQuizSession.create({
    data: {
      userId,
    },
  });

  for (const answer of answers) {
    const quiz = await prisma.stepEightQuiz.findUnique({
      where: { id: answer.quizId },
    });

    if (!quiz) continue;

    const isCorrect =
      answer.selectedOption.toLowerCase() === quiz.correctAnswer.toLowerCase();

    const selectedValue = quiz[answer.selectedOption];

  
    await prisma.stepEightQuizAttempt.create({
      data: {
        userId,
        quizId: quiz.id,
        sessionId: session.id, // ✅ link to session
        selectedOption: answer.selectedOption,
        isCorrect,
      },
    });

    results.push({
      quizId: quiz.id,
      questionText: quiz.questionText,
      selectedOption: answer.selectedOption,
      selectedValue,
      correctAnswer: quiz.correctAnswer,
      isCorrect,
    });
  }

  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const incorrect = total - correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    userId,
    sessionId: session.id,
    summary: {
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: incorrect,
      scorePercentage: percentage,
    },
    details: results,
  };
};


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
  uploadQuiz,
  createStepNine,
  getQuizQustion,
  submitQuizAnswers,
};
