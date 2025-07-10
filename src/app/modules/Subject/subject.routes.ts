import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { SubjectController } from "./subject.controller";
import auth from "../../middlewares/auth";
import { s3Uploader } from "../../../helpars/s3Bucket/fileUploadToS3";
import { UserRole } from "@prisma/client";


const router = express.Router();

const fileUpload = s3Uploader.single("file");

// const upload = multer({ storage: createStorage("subject") });
// const fileUpload = upload.single("file");

router.post('/:classId', fileUpload, SubjectController.createSubject);
router.get('/class-wise-subject/:classId', SubjectController.classWiseSubject);
router.patch('/update-visibility/:subjectId', SubjectController.updatevisibility);
router.patch('/delete/:subjectId',auth(UserRole.ADMIN), SubjectController.deletecourse);
router.get('/', SubjectController.getAllSubjects);
router.get('/subject-wise-chapter/:subjectId', auth(), SubjectController.subjectWiseChapter);

export const subjectRoutes = router;