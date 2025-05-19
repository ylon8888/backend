import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { SubjectService } from "./subject.service";
import { Isubject } from "./subject.interface";

const createSubject = catchAsync(async (req: Request, res: Response) => {
  const classId = req.params.id;
  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const subjectData: Isubject = {
    banner: `${process.env.BACKEND_IMAGE_URL}/subject/${file.filename}`,
    classId,
    ...parseData,
  };

  const classData = await SubjectService.createSubject(subjectData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subject created successfully",
    data: classData,
  });
});

const getAllSubjects = catchAsync(async (req: Request, res: Response) => {

  const subject = await SubjectService.getAllSubjects();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subject retrive successfully",
    data: subject,
  });
});


const updatevisibility = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.id;

  const classVisibility = await SubjectService.updatevisibility(
    subjectId,
    req.body.isVisible
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Update subject visibility successfully",
    data: classVisibility,
  });
});

const subjectWiseChapter = catchAsync(async (req: Request, res: Response) => {
  const subjectId = req.params.id;

  const classVisibility = await SubjectService.subjectWiseChapter(
    subjectId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chapter retrieved successfully",
    data: classVisibility,
  });
});

export const SubjectController = {
  createSubject,
  updatevisibility,
  getAllSubjects,
  subjectWiseChapter
};
