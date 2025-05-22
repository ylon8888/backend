import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { TestimonialRoutes } from "../modules/Testimonial/testimonial.routes";
import { ContactRoutes } from "../modules/Contact/contact.routes";
import { BlogRoutes } from "../modules/Blog/blog.route";
import { StudentRoutes } from "../modules/Student/student.route";
import { classRoutes } from "../modules/Class/class.route";
import { subjectRoutes } from "../modules/Subject/subject.routes";
import { ChapterRoutes } from "../modules/Chapter/chapter.routes";
import { topicRoutes } from "../modules/Topic/topic.routes";
import { PodcastRoutes } from "../modules/Podcast/podcast.routes";
import { QuizRoutes } from "../modules/Quiz/quiz.routes";
import { StepsRoutes } from "../modules/Steps/step.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/testimonial",
    route: TestimonialRoutes,
  },
  {
    path: "/contact",
    route: ContactRoutes,
  },
  {
    path: "/blog",
    route: BlogRoutes,
  },
  {
    path: "/student",
    route: StudentRoutes
  },
  {
    path: "/class",
    route: classRoutes
  },
  {
    path: "/subject",
    route: subjectRoutes
  },
  {
    path: "/chapter",
    route: ChapterRoutes
  },
  {
    path: "/topic",
    route: topicRoutes
  },
  {
    path: "/podcast",
    route: PodcastRoutes
  },
  {
    path: "/quiz",
    route: QuizRoutes
  },
   {
    path: "/step",
    route: StepsRoutes
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
