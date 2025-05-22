import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { StepController } from "./step.controller";

const router = express.Router();

const upload = multer({ storage: createStorage("blog") });
const fileUpload = upload.single("file");

router.post('/one/:chapterId', fileUpload, StepController.createStepOne);

export const StepsRoutes = router;