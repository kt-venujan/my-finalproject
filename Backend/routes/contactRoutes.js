import express from "express";
import { sendContact, getContacts } from "../controllers/contactController.js";

const router = express.Router();

router.post("/send", sendContact);
router.get("/all", getContacts);

export default router;