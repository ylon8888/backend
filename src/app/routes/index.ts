import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { TestimonialRoutes } from "../modules/Testimonial/testimonial.routes";
import { ContactRoutes } from "../modules/Contact/contact.routes";
import { BlogRoutes } from "../modules/Blog/blog.route";
import { StudentRoutes } from "../modules/Student/student.route";

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
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
