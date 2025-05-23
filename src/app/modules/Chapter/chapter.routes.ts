import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { ChapterController } from "./chapter.controller";

const router = express.Router();

const upload = multer({ storage: createStorage("chapter") });

const fileUpload = upload.single("file");

router.post('/:subjectId', fileUpload, ChapterController.createchapter);
router.get('/chapter-wise-steps/:chapterId', ChapterController.getChapterWiseSteps);

export const ChapterRoutes = router;
