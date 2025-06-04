import express from "express";
import { StudentController } from "./student.controller";
import auth from "../../middlewares/auth";
import { createStorage } from "../../../helpars/fileUploader";
import multer from "multer";
import validateRequest from "../../middlewares/validateRequest";
import { createProfileSchema } from "./student.validation";
import { UserRole } from "@prisma/client";
import { s3Uploader } from "../../../helpars/s3Bucket/fileUploadToS3";


const router = express.Router();

const fileUpload = s3Uploader.single("file");

// const upload = multer({ storage: createStorage("profile") });
// const fileUpload = upload.single("file");

router.get('/profile',auth(), StudentController.getStudentProfile);

// Hero Section
router.get('/brain-drawer', StudentController.brainDrawerLearning);


// Student Enroll course
router.get('/enroll-course', auth(), StudentController.studentEnrollCourse);
router.get('/enroll-course-chapter/:subjectId', auth(), StudentController.studentEnrollChapter);
router.get('/chapter-quiz/:chapterId', auth(), StudentController.studentChapterQuizAttempt);
router.get('/progress', auth(), StudentController.studentProgress);
router.get('/course-progress', auth(), StudentController.subjectCourseProgress);

router.post("/register", StudentController.registration);

router.post('/create-profile',auth(), fileUpload, StudentController.createUpdateProfile); //  validateRequest(createProfileSchema),

// Admin Dashboard get Student Information
router.get('/retrive-student-details', StudentController.studentDetails);
router.get('/admin-get-all-students', StudentController.getAllStudents);  // auth(UserRole.ADMIN)
router.get('/overall-graph', StudentController.getOverallGraph); // auth(UserRole.ADMIN)
router.get('/participation', StudentController.participation); // auth(UserRole.ADMIN)
router.get('/admin-get-student/:studentId', StudentController.getStudentById); // auth(UserRole.ADMIN)


export const StudentRoutes = router;
