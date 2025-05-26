import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StudentService } from "./student.service";


const registration = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.registration(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent! Please verify your email to complete registration.",
    data: result,
  });
});


export const StudentController = {
  registration,
};
