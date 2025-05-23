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

  const stepData: any = {
    stepVideo: `${process.env.BACKEND_IMAGE_URL}/step/${file.filename}`,
    ...req.body,
  };

  console.log("controller",stepData)

  const step = await StepService.createStepOne(chapterId,stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step created successfully",
    data: step,
  });
});


const createStepTwo = catchAsync(async (req: Request, res: Response) => {
  const chapterId = req.params.chapterId;

  if (!req.files || Array.isArray(req.files)) {
    throw new ApiError(httpStatus.EXPECTATION_FAILED, "Invalid file upload data.");
  }

  const podcastContent = req.files["poadcast"] as Express.Multer.File[];

  const podcastVideo = podcastContent?.map(
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



export const StepController = {
    createStepOne,
    createStepTwo
}