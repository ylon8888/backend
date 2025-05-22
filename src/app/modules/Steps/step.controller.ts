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

  const step = await StepService.createStepOne(chapterId,stepData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Step created successfully",
    data: step,
  });
});


export const StepController = {
    createStepOne
}