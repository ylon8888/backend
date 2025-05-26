import express from "express";
import { StudentController } from "./student.controller";
import auth from "../../middlewares/auth";


const router = express.Router();

router.post("/register", StudentController.registration);


export const StudentRoutes = router;
