import express from "express";
import { StudentController } from "./student.controller";
import auth from "../../middlewares/auth";
import { createStorage } from "../../../helpars/fileUploader";
import multer from "multer";
import validateRequest from "../../middlewares/validateRequest";
import { createProfileSchema } from "./student.validation";


const router = express.Router();

const upload = multer({ storage: createStorage("profile") });

const fileUpload = upload.single("file");

router.get('/profile',auth(), StudentController.getStudentProfile);

router.post("/register", StudentController.registration);

router.post('/create-profile',auth(), fileUpload, validateRequest(createProfileSchema), StudentController.createUpdateProfile);

// Admin Dashboard get Student Information
router.get('/admin-get-student/:userId',auth(), StudentController.getStudentProfile);

export const StudentRoutes = router;
