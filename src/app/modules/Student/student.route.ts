import express from "express";
import { StudentController } from "./student.controller";
import auth from "../../middlewares/auth";
import { createStorage } from "../../../helpars/fileUploader";
import multer from "multer";
import validateRequest from "../../middlewares/validateRequest";
import { createProfileSchema } from "./student.validation";
import { UserRole } from "@prisma/client";


const router = express.Router();

const upload = multer({ storage: createStorage("profile") });

const fileUpload = upload.single("file");

router.get('/profile',auth(), StudentController.getStudentProfile);

router.post("/register", StudentController.registration);

router.post('/create-profile',auth(), fileUpload, validateRequest(createProfileSchema), StudentController.createUpdateProfile);

// Admin Dashboard get Student Information
router.get('/retrive-student-details', StudentController.studentDetails);
router.get('/admin-get-all-students', StudentController.getAllStudents);  // auth(UserRole.ADMIN)
router.get('/overall-graph', StudentController.getOverallGraph); // auth(UserRole.ADMIN)
router.get('/participation', StudentController.participation); // auth(UserRole.ADMIN)
router.get('/admin-get-student/:studentId', StudentController.getStudentById); // auth(UserRole.ADMIN)


export const StudentRoutes = router;
