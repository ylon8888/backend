import express from "express";
import { StudentController } from "./student.controller";
import auth from "../../middlewares/auth";


const router = express.Router();

router.post("/register", StudentController.registration);

// Course details
router.get('/course-details/:subjectId', StudentController.courseDetails);

// Couese review 
router.post('/course-review/:chapterId', auth(), StudentController.courseReview);
router.get('/course-review/:subjectId', StudentController.getCourseReview);

export const StudentRoutes = router;
