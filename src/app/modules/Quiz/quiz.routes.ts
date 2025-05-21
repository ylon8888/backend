import { UserRole } from "@prisma/client";
import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { QuizController } from "./quiz.controller";

const router = express.Router();

const upload = multer({ storage: createStorage("podcast") });

const fileUpload = upload.single("file");

router.post('/:chapterId', QuizController.createQuiz);
router.get('/student/:chapterId', QuizController.studentChapterQuiz);
router.get('/admin/:chapterId', QuizController.adminChapterQuiz);
router.patch('/disable/:quizId', QuizController.disableQuiz);

export const QuizRoutes = router;
