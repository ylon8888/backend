import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { classController } from "./class.controller";


const router = express.Router();


router.get('/', classController.getAllClasses);
router.get('/student-class', classController.studentAllClass);
router.get('/class-wise-chapter/:id', classController.classWiseChapter);
router.post('/', classController.createClass);
router.patch('/class-visibility/:id', classController.classVisibility);


export const classRoutes = router;