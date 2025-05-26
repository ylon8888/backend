import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { ClassService } from "./class.service";
import { IClass } from "./class.interface";



const createClass = catchAsync(async (req: Request, res: Response) => {

  const classData = await ClassService.createClass(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Class created successfully",
    data: classData,
  });
});


const getAllClasses = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const blogs = await ClassService.getAllClass(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Classes retrieved successfully",
    data: blogs,
  });
});

const studentAllClass = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const blogs = await ClassService.studentAllClass(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Classes retrieved successfully",
    data: blogs,
  });
});


const classWiseChapter = catchAsync(async (req: Request,res: Response) => {
  const classId = req.params.id; 

  const singleClasss = await ClassService.classWiseChapter(classId);

 sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Classes retrieved successfully",
    data: singleClasss,
  });

})


const classVisibility = catchAsync(async (req: Request,res: Response) => {
  const classId = req.params.id; 

  const classVisibility = await ClassService.classVisibility(classId);

 sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Update class visibility successfully",
    data: classVisibility,
  });
})

export const classController = {
    createClass,
    getAllClasses,
    classWiseChapter,
    classVisibility,
    studentAllClass
}