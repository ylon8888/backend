import express from "express";
import { BlogController } from "./blog.controller";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { s3Uploader } from "../../../helpars/s3Bucket/fileUploadToS3";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

const fileUpload = s3Uploader.single("file");

// const upload = multer({ storage: createStorage("blog") });
// const fileUpload = upload.single("file");

router.post("/", auth(UserRole.ADMIN), fileUpload, BlogController.blogCreate);
router.post("/upload-image", fileUpload, BlogController.uploadImage);
router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getSingleBlog);
router.patch(
  "/:id",
  auth(UserRole.ADMIN),
  fileUpload,
  BlogController.blogUpdate
);
router.delete("/:id", auth(UserRole.ADMIN), BlogController.blogDelete);

export const BlogRoutes = router;
