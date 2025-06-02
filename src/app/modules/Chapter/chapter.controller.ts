import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { IChapter } from "./chapter.interface";
import { ChapterService } from "./chapter.service";


const createchapter = catchAsync(async (req: Request, res: Response) => {

  const { file } = req;
  const subjectId = req.params.subjectId;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data)


  const chapterData: IChapter = {
    thumbnail: `${process.env.BACKEND_IMAGE_URL}/chapter/${file.filename}`,
    subjectId,
    ...parseData
  };


  const chapter = await ChapterService.createchapter(chapterData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Chapter created successfully",
    data: chapter,
  });
});

const getChapterWiseSteps = catchAsync(async (req: Request, res: Response) => {
    const chapterId = req.params.chapterId;
    const userId = req.user.id;

  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const blogs = await ChapterService.getChapterWiseSteps(filters, options, chapterId, userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chapter retrieved successfully",
    data: blogs,
  });
});

export const ChapterController = {
    createchapter,
    getChapterWiseSteps
}