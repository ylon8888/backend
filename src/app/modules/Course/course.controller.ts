import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { CourseService } from "./course.service";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";

const courseDetails = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;

  const classVisibility = await CourseService.courseDetails(subjectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course details retrieved successfully",
    data: classVisibility,
  });
});

const courseReview = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;
  const userId = req.user.id;

  const body = {
    chapterId,
    userId,
    ...req.body,
  };

  const classVisibility = await CourseService.courseReview(body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Create course review successfully",
    data: classVisibility,
  });
});

const getCourseReview = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;

  const classVisibility = await CourseService.getCourseReview(subjectId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved course review successfully",
    data: classVisibility,
  });
});

const getAllCourseReview = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "date"]);
  const options = pick(req.query, paginationFields);

  const classVisibility = await CourseService.getAllCourseReview(
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved course review successfully",
    data: classVisibility,
  });
});

const createCourseEnroll = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;
  const userId = req.user.id;

  const bodyData = {
    subjectId,
    userId,
    ...req.body,
  };

  const courseEntroll = await CourseService.createCourseEnroll(bodyData);

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

  const result = await CourseService.enrollVerification({
    userId,
    subjectId,
    otp,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Enrollment verified successfully",
    data: result,
  });
});

const checkingEnrollment = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.subjectId;
  const userId = req.user.id;

  const courseEntroll = await CourseService.checkingEnrollment(
    userId,
    subjectId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Checking entrollment",
    data: courseEntroll,
  });
});

const getAllReview = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const review = await CourseService.getAllReview(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course retrieved successfully",
    data: review,
  });
});

const chapterEnrollStudent = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);
  const chapterId = req.params.chapterId;

  const chapter = await CourseService.chapterEnrollStudent(
    chapterId,
    filters,
    options
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chapter retrieved successfully",
    data: chapter,
  });
});

const capterQuizDetails = catchAsync(async (req: Request, res: Response) => {
  const {userId, chapterId} = req.body;

  const result = await CourseService.capterQuizDetails(userId, chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrive chapter quiz details successfully",
    data: result,
  });
});

export const CourseController = {
  courseDetails,
  courseReview,
  getCourseReview,
  createCourseEnroll,
  verifyEnrollment,
  checkingEnrollment,
  getAllCourseReview,
  getAllReview,
  chapterEnrollStudent,
  capterQuizDetails,
};
