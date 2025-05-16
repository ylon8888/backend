import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { TestimonialRoutes } from "../modules/Testimonial/testimonial.routes";
import { ContactRoutes } from "../modules/Contact/contact.routes";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
