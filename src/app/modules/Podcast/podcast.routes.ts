import { UserRole } from "@prisma/client";
import express from "express";
import { PodcastController } from "./podcast.controller";
import multer from "multer";
import { createStorage } from "../../../helpars/fileUploader";

const router = express.Router();

const upload = multer({ storage: createStorage("podcast") });

const fileUpload = upload.single("file");

router.post("/", fileUpload, PodcastController.createPodcast);
router.get(
  "/chapters/:chapterId/topics/:topicId",
  PodcastController.getChapterPodcast
);

export const PodcastRoutes = router;
