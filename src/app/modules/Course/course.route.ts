import express from "express";
import auth from "../../middlewares/auth";
import { CourseController } from "./course.controller";


const router = express.Router();


// Admin Dashboard Chapter finished functionality   ----> Chapter wise details
router.get('/chapter-enroll-student/:chapterId', CourseController.chapterEnrollStudent);
router.get('/chapter-quiz-details', CourseController.capterQuizDetails);



// Course details
router.get('/course-details/:subjectId', auth(), CourseController.courseDetails);

// Checking enrollemnt
router.get('/checking-enrollment/:subjectId', auth(), CourseController.checkingEnrollment);

// Couese review 
router.post('/course-review/:chapterId', auth(), CourseController.courseReview);
router.get('/course-review', CourseController.getAllCourseReview);  //  <--- Admin

// Admin 
// router.get('/admin-course-review', CourseController.getAllCourseReview); //  <--- Admin

router.get('/course-review/:subjectId', CourseController.getCourseReview);


// Course Entroll
router.post('/course-enroll/:subjectId', auth(), CourseController.createCourseEnroll)
router.patch('/verify-enrollment', auth(), CourseController.verifyEnrollment)
router.post("/resend-otp/:subjectId", auth(), CourseController.resendOtp);




export const CourseRoutes = router;
