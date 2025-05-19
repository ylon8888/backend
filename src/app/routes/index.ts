import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { TestimonialRoutes } from "../modules/Testimonial/testimonial.routes";
import { ContactRoutes } from "../modules/Contact/contact.routes";
import { BlogRoutes } from "../modules/Blog/blog.route";
import { StudentRoutes } from "../modules/Student/student.route";
import { classRoutes } from "../modules/Class/class.route";
import { subjectRoutes } from "../modules/Subject/subject.routes";

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
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
