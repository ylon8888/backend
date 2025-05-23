import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { StepService } from "./step.service";

const createStepOne = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...parseData,
  };

  console.log("controller", stepData);

  const step = await StepService.createStepOne(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step one created successfully",
    data: step,
  });
});

const createStepTwo = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  if (!req.files || Array.isArray(req.files)) {
    throw new ApiError(
      httpStatus.EXPECTATION_FAILED,
      "Invalid file upload data."
    );
  }

  const podcastContent = req.files["poadcast"] as Express.Multer.File[];

  const podcastVideo =
    podcastContent?.map(
      (file) => `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`
    ) || [];

  const parseData = req.body.data && JSON.parse(req.body.data);

  if (!parseData?.podcastName) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Podcast name is required.");
  }

  const stepData = {
    podcastVideo,
    podcastName: parseData.podcastName, // ensure it's included
  };

  const step = await StepService.createStepTwo(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Podcast created successfully",
    data: step,
  });
});

const createStepThree = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...parseData,
  };

  const step = await StepService.createStepThree(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step three created successfully",
    data: step,
  });
});

const createStepFour = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...parseData,
  };

  const step = await StepService.createStepFour(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step four created successfully",
    data: step,
  });
});

const createStepFive = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...parseData,
  };

  const step = await StepService.createStepFive(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step four created successfully",
    data: step,
  });
});

const createStepSix = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...parseData,
  };

  const step = await StepService.createStepSix(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step six created successfully",
    data: step,
  });
});

const createStepSeven = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...parseData,
  };

  const step = await StepService.createStepSeven(chapterId, stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step seven created successfully",
    data: step,
  });
});

const createStepEight = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const step = await StepService.createStepEight(chapterId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step eight created successfully",
    data: step,
  });
});


const getQuizes = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const step = await StepService.getQuizes(chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrive quizes successfully",
    data: step,
  });
});


const disableQuize = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId;

  const step = await StepService.disableQuize(quizId, req.body.isDisable);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quize disable successfully",
    data: step,
  });
});

const getStudentQuizes = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  const step = await StepService.getStudentQuizes(chapterId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Retrive quizes successfully",
    data: step,
  });
});

const uploadQuiz = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params.quizId;

  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No file uploaded");
  }

  const step = await StepService.uploadQuiz(quizId, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz uploaded successfully",
    data: step,
  });
});



export const StepController = {
  createStepOne,
  createStepTwo,
  createStepThree,
  createStepFour,
  createStepFive,
  createStepSix,
  createStepSeven,
  createStepEight,
  getQuizes,
  getStudentQuizes,
  disableQuize,
  uploadQuiz
};
