import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { CourseProgressService } from "./courseProgress.service";


const createProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const progressData = {
    userId,
    ...req.body
  }

  const chapterProgress = await  CourseProgressService.createProgress(progressData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Create chapter progress sucessfully",
    data: chapterProgress,
  });
});




export const CourseProgresscontroller = {
  createProgress,

}