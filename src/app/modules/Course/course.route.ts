import express from "express";
import auth from "../../middlewares/auth";
import { CourseController } from "./course.controller";


const router = express.Router();


// Course details
router.get('/course-details/:subjectId', CourseController.courseDetails);

// Checking enrollemnt
router.get('/checking-enrollment/:subjectId', auth(), CourseController.checkingEnrollment);

// Couese review 
router.post('/course-review/:chapterId', auth(), CourseController.courseReview);
router.get('/course-review', auth(), CourseController.getAllCourseReview);
router.get('/course-review/:subjectId', CourseController.getCourseReview);

// Course Entroll
router.post('/course-enroll/:subjectId', auth(), CourseController.createCourseEnroll)
router.patch('/verify-enrollment', auth(), CourseController.verifyEnrollment)




export const CourseRoutes = router;
