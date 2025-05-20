import { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import ApiError from "../../../errors/ApiErrors";
import { PodcastService } from "./podcast.service";


const createPodcast = catchAsync(async (req: Request, res: Response) => {

  const { file } = req;
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data)


  const podcastData: any = {
    podcastContent: `${process.env.BACKEND_IMAGE_URL}/podcast/${file.filename}`,
    ...parseData
  };


  const podcast = await PodcastService.createPodcast(podcastData);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Podcast created successfully",
    data: podcast,
  });
});


export const PodcastController = {
    createPodcast
}