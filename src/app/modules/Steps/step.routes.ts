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

const quizUpload = upload.single("quiz");

router.post('/one/:chapterId', fileUpload, StepController.createStepOne);
router.post('/two/:chapterId', uploadPodcast, StepController.createStepTwo);
router.post('/three/:chapterId', fileUpload, StepController.createStepThree);
router.post('/four/:chapterId', fileUpload, StepController.createStepFour);
router.post('/five/:chapterId', fileUpload, StepController.createStepFive);
router.post('/six/:chapterId', fileUpload, StepController.createStepSix);
router.post('/seven/:chapterId', fileUpload, StepController.createStepSeven);
router.post('/eight/:chapterId', StepController.createStepEight);
router.post('/nine/:chapterId', fileUpload, StepController.createStepNine);

// Quiz
router.get('/get-quizes/:chapterId', StepController.getQuizes);
router.get('/get-student-quizes/:chapterId', StepController.getStudentQuizes);
router.get('/quiz-question/:quizId', StepController.getQuizQustion);  // Step 8 id
router.patch('/disable-quiz/:quizId', StepController.disableQuize);

// Create Quiz Question
router.post('/quiz/:quizId',quizUpload, StepController.uploadQuiz);

export const StepsRoutes = router;