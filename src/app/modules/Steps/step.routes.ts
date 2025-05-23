import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { StepController } from "./step.controller";

const router = express.Router();

const upload = multer({ storage: createStorage("step") });
const fileUpload = upload.single("file");

const uploadPodcast = upload.fields([
  { name: "poadcast", maxCount: 6 },
]);

router.post('/one/:chapterId', fileUpload, StepController.createStepOne);
router.post('/two/:chapterId', uploadPodcast, StepController.createStepTwo);

export const StepsRoutes = router;