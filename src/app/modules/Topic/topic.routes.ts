import express from "express";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";
import { TopicController } from "./topic.controller";



const router = express.Router();

const upload = multer({ storage: createStorage("topic") });

const fileUpload = upload.single("file");

router.post('/:chapterId', fileUpload, TopicController.createTopic)

export const topicRoutes = router;