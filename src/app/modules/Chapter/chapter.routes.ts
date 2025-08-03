import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { ChapterController } from "./chapter.controller";
import auth from "../../middlewares/auth";
import { s3Uploader } from "../../../helpars/s3Bucket/fileUploadToS3";
import { UserRole } from "@prisma/client";

const router = express.Router();

const fileUpload = s3Uploader.single("file");

// const upload = multer({ storage: createStorage("chapter") });
// const fileUpload = upload.single("file");

router.post(
  "/:subjectId",
  auth(UserRole.ADMIN),
  fileUpload,
  ChapterController.createchapter
);
router.get(
  "/chapter-wise-steps/:chapterId",
  auth(),
  ChapterController.getChapterWiseSteps
);

// Delete Chapter
router.patch(
  "/delete/:chapterId",
  auth(UserRole.ADMIN),
  ChapterController.deleteChapter
);

export const ChapterRoutes = router;
