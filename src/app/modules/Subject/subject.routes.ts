import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { SubjectController } from "./subject.controller";


const router = express.Router();

const upload = multer({ storage: createStorage("subject") });

const fileUpload = upload.single("file");

router.post('/:classId', fileUpload, SubjectController.createSubject);
router.patch('/update-visibility/:subjectId', SubjectController.updatevisibility);
router.get('/', SubjectController.getAllSubjects);
router.get('/subject-wise-chapter/:subjectId', SubjectController.subjectWiseChapter);

export const subjectRoutes = router;