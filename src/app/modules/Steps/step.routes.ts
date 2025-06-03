import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { StepController } from "./step.controller";
import auth from "../../middlewares/auth";
import { s3Uploader } from "../../../helpars/s3Bucket/fileUploadToS3";

const router = express.Router();

const fileUpload = s3Uploader.single("file");

const upload = multer({ storage: createStorage("step") });
// const fileUpload = upload.single("file");
const uploadPodcast = upload.fields([
  { name: "poadcast", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
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

// Get all steps
router.get('/one/:stepId', StepController.getStepOne);
router.get('/two/:stepId', StepController.getStepTwo);
router.get('/three/:stepId', StepController.getStepThree);
router.get('/four/:stepId', StepController.getStepFour);
router.get('/five/:stepId', StepController.getStepFive);
router.get('/six/:stepId', StepController.getStepSix);
router.get('/seven/:stepId', StepController.getStepSeven);
router.get('/eight/:stepId', StepController.getStepEight);

// Quiz
router.get('/get-quizes/:chapterId', StepController.getQuizes);
router.get('/get-student-quizes/:chapterId', StepController.getStudentQuizes);
router.get('/quiz-question/:quizId', StepController.getQuizQustion);  // Step 8 id
router.get('/quiz-result/:quizId', auth(), StepController.getQuizResult);   // <--- Student Quiz result

router.patch('/disable-quiz/:quizId', StepController.disableQuize);

// Create Quiz Question
router.post('/quiz/:quizId',quizUpload, StepController.uploadQuiz);

// Submit Quiz Answers
router.post('/submit-quiz/:stepEightId', auth(), StepController.submitQuizAnswers);

export const StepsRoutes = router;