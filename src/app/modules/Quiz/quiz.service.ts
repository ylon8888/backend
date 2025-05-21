import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelpers } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { IQuiz } from "./quiz.interface";

const createQuiz = async (chapterId: string, quizData: IQuiz) => {
  const quiz = await prisma.quiz.create({
    data: {
      chapterId,
      quizName: quizData.quizName,
      quizDescription: quizData.quizDescription,
    },
  });

  return quiz;
};


const studentChapterQuiz = async(chapterId: string) => {
    const quizes = await prisma.quiz.findMany({
        where: {
            chapterId,
            isDisable: false
        }
        
    })

    return {
        quizes
    }
}


const adminChapterQuiz = async(chapterId: string) => {
    const quizes = await prisma.quiz.findMany({
        where: {
            chapterId,
        }
        
    })

    return {
        quizes
    }
}


const disableQuiz = async(quizId: string ,isDisable: boolean) =>{
  const quiz = await prisma.quiz.findUnique({
    where: {
      id: quizId
    }
  })

  if(!quiz){
    throw new ApiError(httpStatus.NOT_FOUND, "Quiz not found");
  }

  const disableQuiz = await prisma.quiz.update({
    where: {
      id: quizId
    },
    data:{
      isDisable: isDisable
    }
  })

  return disableQuiz;
}

export const QuizService = {
  createQuiz,
  studentChapterQuiz,
  adminChapterQuiz,
  disableQuiz
};
