import { UserRole } from "@prisma/client";
import express from "express";
import { TestimonialController } from "./testimonial.controller";


const router = express.Router();

router.post('/', TestimonialController.createTestimonial)
router.get('/', TestimonialController.getAllTestimonial)
router.get('/:id', TestimonialController.singleTestimonial)
router.patch('/:id', TestimonialController.displayTestimonial)
router.delete('/:id', TestimonialController.deleteTestimonial)


export const TestimonialRoutes = router;