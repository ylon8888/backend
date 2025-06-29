import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BlogService } from "./blog.service";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";
import { IBlog } from "./blog.interface";
import pick from "../../../shared/pick";
import { paginationFields } from "../../../constants/pagination";
import { fileUploadToS3 } from "../../../helpars/s3Bucket/fileUploadToS3";

const blogCreate = catchAsync(async (req: Request, res: Response) => {
  const { body, file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const parseData = req.body.data && JSON.parse(req.body.data);

  const blogImage = await fileUploadToS3(
    "blogFile",
    "blog",
    file.originalname,
    file.mimetype,
    file.path
  );

  const blogData: IBlog = {
    // image: `${process.env.BACKEND_IMAGE_URL}/blog/${file.filename}`,
    image: blogImage,
    ...parseData,
  };

  const blog = await BlogService.createBlog(blogData);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Blog created successfully",
    data: blog,
  });
});

const blogUpdate = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { file } = req;
  let image = "";

  const parseData = req.body.data && JSON.parse(req.body.data);

  if (file) {
    // image = `${process.env.BACKEND_IMAGE_URL}/blog/${file.filename}`;
    image = await fileUploadToS3(
      "blogFile",
      "blog",
      file.originalname,
      file.mimetype,
      file.path
    );
  }

  const body = {
    image,
    ...parseData,
  };

  const blog = await BlogService.updateBlog(id, body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog updated successfully",
    data: blog,
  });
});

const blogDelete = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await BlogService.deleteBlog(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog deleted successfully",
    data: blog,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm"]);
  const options = pick(req.query, paginationFields);

  const blogs = await BlogService.getAllBlogs(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blogs retrieved successfully",
    data: blogs,
  });
});

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const blog = await BlogService.getSingleBlog(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Blog retrieved successfully",
    data: blog,
  });
});

const uploadImage = catchAsync(async (req: Request, res: Response) => {
  const { file } = req;

  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "File is required");
  }

  const image = await fileUploadToS3(
    "blogFile",
    "blog",
    file.originalname,
    file.mimetype,
    file.path
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Retive image successfully",
    data: image,
  });
});

export const BlogController = {
  blogCreate,
  blogUpdate,
  blogDelete,
  getAllBlogs,
  getSingleBlog,
  uploadImage
};
