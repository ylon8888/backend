import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { SubjectController } from "./subject.controller";


const router = express.Router();

const upload = multer({ storage: createStorage("subject") });

const fileUpload = upload.single("file");

router.post('/:id', fileUpload, SubjectController.createSubject);
router.patch('/update-visibility/:id', SubjectController.updatevisibility);
router.get('/', SubjectController.getAllSubjects);

export const subjectRoutes = router;