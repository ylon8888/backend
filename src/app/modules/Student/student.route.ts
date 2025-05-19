import express from "express";
import { StudentController } from "./student.controller";


const router = express.Router();

router.post("/register", StudentController.registration);

export const StudentRoutes = router;
