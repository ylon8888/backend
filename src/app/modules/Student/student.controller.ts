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


const courseDetails = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;

  const classVisibility = await StudentService.courseDetails(
    subjectId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details retrieved successfully",
    data: classVisibility,
  });
});


const courseReview = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;
  const useId = req.user.id;

  const body = {
    chapterId,
    useId,
    ...req.body
  }

  const classVisibility = await StudentService.courseReview(body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Create course review successfully",
    data: classVisibility,
  });
});


const getCourseReview = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;

  const classVisibility = await StudentService.getCourseReview(
    subjectId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved course review successfully",
    data: classVisibility,
  });
});


const createCourseEnroll =  catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;
  const userId = req.user.id;

  const bodyData = {
    subjectId,
    userId,
    ...req.body
  }

  const courseEntroll = await StudentService.createCourseEnroll(bodyData)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent! Please verify your email to complete enrollment.",
    data: courseEntroll,
  });
});

const verifyEnrollment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const { subjectId, otp } = req.body;

  const result = await StudentService.enrollVerification({ userId, subjectId, otp });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Enrollment verified successfully",
    data: result,
  });
});


export const StudentController = {
  registration,
  courseDetails,
  courseReview,
  getCourseReview,
  createCourseEnroll,
  verifyEnrollment
};
