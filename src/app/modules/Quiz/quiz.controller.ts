import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import ApiError from "../../../errors/ApiErrors";
import { QuizService } from "./quiz.service";

const createQuiz = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const quiz = await QuizService.createQuiz(chapterId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});

const studentChapterQuiz = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const quiz = await QuizService.studentChapterQuiz(chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});


const adminChapterQuiz = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const quiz = await QuizService.adminChapterQuiz(chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz created successfully",
    data: quiz,
  });
});


const disableQuiz =  catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId;

  const quiz = await QuizService.disableQuiz(quizId, req.body?.isDisable);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz disabled successfully",
    data: quiz,
  });
});

export const QuizController = {
    createQuiz,
    studentChapterQuiz,
    adminChapterQuiz,
    disableQuiz
}