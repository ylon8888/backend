import express from "express";
import auth from "../../middlewares/auth";
import { CourseProgresscontroller } from "./courseProgress.controller";

const router = express.Router();

// stident progrees 
router.get('/student-progress', auth(), CourseProgresscontroller.studentProgress)

router.post('/create-progress', auth(), CourseProgresscontroller.createProgress)
router.post('/create-eight-progress', auth(), CourseProgresscontroller.completeStepEightProgress)
router.post('/create-next-progress', auth(), CourseProgresscontroller.createNextProgress)

export const ProgressRoutes = router;