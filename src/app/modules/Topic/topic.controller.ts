import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { ITopic } from "./topic.interface";
import { Topicervice } from "./topic.service";

const createTopic = catchAsync(async (req: Request, res: Response) => {

  const { file } = req;
  const chapterId = req.params.chapterId;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data)


  const topicData: ITopic = {
    topicVideo: `${process.env.BACKEND_IMAGE_URL}/topic/${file.filename}`,
    chapterId,
    ...parseData
  };


  const topic = await Topicervice.createTopic(topicData)
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Topic created successfully",
    data: topic,
  });
});



export const TopicController = {
    createTopic
}