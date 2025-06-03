import express from "express";
import { BlogController } from "./blog.controller";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import {s3Uploader} from "../../../helpars/s3Bucket/fileUploadToS3";

const router = express.Router();

const fileUpload = s3Uploader.single("file");

// const upload = multer({ storage: createStorage("blog") });
// const fileUpload = upload.single("file");

router.post("/", fileUpload, BlogController.blogCreate);
router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getSingleBlog);
router.patch("/:id", fileUpload, BlogController.blogUpdate);
router.delete("/:id", BlogController.blogDelete);

export const BlogRoutes = router;
