import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StudentService } from "./student.service";
import ApiError from "../../../errors/ApiErrors";


const registration = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.registration(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent! Please verify your email to complete registration.",
    data: result,
  });
});


const createUpdateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { file } = req;
  let profileImage;

  if (file) {
    profileImage = `${process.env.BACKEND_IMAGE_URL}/profile/${file.filename}`
  }

  const parseJSON = (value: any) => {
    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch {
      return [];
    }
  };

  const profileData = {
    userId,
    profileImage,
    gurdianContact: parseJSON(req.body.gurdianContact),          // Array
    academicInformation: parseJSON(req.body.academicInformation), // Array
    experience: parseJSON(req.body.experience),                 // Array
    hobbies: parseJSON(req.body.hobbies),                       // Array
    skill: parseJSON(req.body.skill),                           // Array
    socialProfile: parseJSON(req.body.socialProfile),           // Array
  };

  const profile = await StudentService.createUpdateProfile(profileData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Profile created or updated successfully",
    data: profile,
  });
});

const getStudentProfile =  catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await StudentService.getStudentProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent! Please verify your email to complete registration.",
    data: result,
  });
});


const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.userId;

  const result = await StudentService.getStudentProfile(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP sent! Please verify your email to complete registration.",
    data: result,
  });
});

export const StudentController = {
  registration,
  createUpdateProfile,
  getStudentProfile
};
