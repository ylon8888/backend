import { UserRole } from "@prisma/client";
import express from "express";
import { ContactController } from "./contact.controller";

const router =  express.Router();

router.post('/', ContactController.createContact);
router.get('/', ContactController.getAllContact);
router.get('/:id', ContactController.singleContact);
router.delete('/:id', ContactController.deleteContact);

export const ContactRoutes = router;