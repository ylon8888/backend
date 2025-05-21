import express from "express";
import { StudentController } from "./student.controller";


const router = express.Router();

router.post("/register", StudentController.registration);
router.get('/course-details/:subjectId', StudentController.courseDetails);


export const StudentRoutes = router;
