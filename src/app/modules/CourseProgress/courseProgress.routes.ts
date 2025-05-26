import express from "express";
import auth from "../../middlewares/auth";
import { CourseProgresscontroller } from "./courseProgress.controller";

const router = express.Router();

router.post('/chapter-progress', auth(), CourseProgresscontroller.createChapterProgress)
router.post('/step-progress', auth(), CourseProgresscontroller.createChapterProgress)

export const ProgressRoutes = router;