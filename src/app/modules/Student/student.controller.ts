import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StudentService } from "./student.service";
import ApiError from "../../../errors/ApiErrors";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";


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
    message: "Retrive student successfully",
    data: result,
  });
});


const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.studentId;

  const result = await StudentService.getStudentById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrive student success",
    data: result,
  });
});


const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const blogs = await StudentService.getAllStudents(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Students retrieved successfully",
    data: blogs,
  });
});

const studentDetails = catchAsync(async (req: Request, res: Response) => {

  const result = await StudentService.studentDetails();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrive student success",
    data: result,
  });
});

const getOverallGraph = catchAsync(async (req: Request, res: Response) => {
  const period = req.query.period as string;

  if (!period) {
    throw new ApiError(httpStatus.BAD_REQUEST, "fromDate query parameter is required");
  }

  const result = await StudentService.overalGraph(period);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Overall progress data retrieved successfully",
    data: result,
  });
}
)


const participation = catchAsync(async (req: Request, res: Response) => {
  const period = req.query.period as string;

  if (!period) {
    throw new ApiError(httpStatus.BAD_REQUEST, "fromDate query parameter is required");
  }

  const result = await StudentService.participation(period);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "participation data retrieved successfully",
    data: result,
  });
}
)

const studentEnrollCourse =  catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;

  const result = await StudentService.studentEnrollCourse(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "participation data retrieved successfully",
    data: result,
  });
}
)


const studentChapterQuizAttempt = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;
  const userId = req.user.id;

  const result = await StudentService.studentChapterQuizAttempt(chapterId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved chapter quiz successfully",
    data: result,
  });
}
)


const studentProgress = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await StudentService.studentProgress(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrieved student progress successfully",
    data: result,
  });
}
)


export const StudentController = {
  registration,
  createUpdateProfile,
  getStudentProfile,
  getStudentById,
  getAllStudents,
  studentDetails,
  getOverallGraph,
  participation,
  studentEnrollCourse,
  studentChapterQuizAttempt,
  studentProgress
};
