import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { StepController } from "./step.controller";
import auth from "../../middlewares/auth";
import { s3Uploader } from "../../../helpars/s3Bucket/fileUploadToS3";
import { UserRole } from "@prisma/client";

const router = express.Router();

const fileUpload = s3Uploader.single("file");
const uploadPodcast = s3Uploader.fields([
  { name: "poadcast", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

const upload = multer({ storage: createStorage("step") });
// const fileUpload = upload.single("file");
// const uploadPodcast = upload.fields([
//   { name: "poadcast", maxCount: 1 },
//   { name: "thumbnail", maxCount: 1 },
// ]);

const quizUpload = upload.single("quiz");

router.post(
  "/one/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepOne
);
router.post(
  "/two/:chapterId",
  auth(UserRole.ADMIN),
  uploadPodcast,
  StepController.createStepTwo
);
router.post(
  "/three/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepThree
);
router.post(
  "/four/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepFour
);
router.post(
  "/five/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepFive
);
router.post(
  "/six/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepSix
);
router.post(
  "/seven/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepSeven
);
router.post(
  "/eight/:chapterId",
  auth(UserRole.ADMIN),
  StepController.createStepEight
);
router.post(
  "/nine/:chapterId",
  auth(UserRole.ADMIN),
  fileUpload,
  StepController.createStepNine
);

// Get all steps
router.get("/one/:stepId", StepController.getStepOne);
router.get("/two/:stepId", StepController.getStepTwo);
router.get("/three/:stepId", StepController.getStepThree);
router.get("/four/:stepId", StepController.getStepFour);
router.get("/five/:stepId", StepController.getStepFive);
router.get("/six/:stepId", StepController.getStepSix);
router.get("/seven/:stepId", StepController.getStepSeven);
router.get("/eight/:stepId", StepController.getStepEight);

// Quiz
router.get("/get-quizes/:chapterId", StepController.getQuizes);
router.get("/get-student-quizes/:chapterId", StepController.getStudentQuizes);
router.get("/quiz-question/:quizId", StepController.getQuizQustion); // Step 8 id
router.get("/quiz-result/:quizId", auth(), StepController.getQuizResult); // <--- Student Quiz result

router.patch("/disable-quiz/:quizId", StepController.disableQuize);

// Create Quiz Question
router.post(
  "/quiz/:quizId",
  auth(UserRole.ADMIN),
  quizUpload,
  StepController.uploadQuiz
);

// Submit Quiz Answers
router.post(
  "/submit-quiz/:stepEightId",
  auth(),
  StepController.submitQuizAnswers
);

export const StepsRoutes = router;
