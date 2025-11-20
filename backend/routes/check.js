import express from "express";
import multer from "multer";
import { checkDocument } from "../controllers/checkController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("pdf"), checkDocument);

export default router;
