import { Router } from "express";
import multer from "multer";
import { existsSync } from "fs";
import { join } from "path";
import {
  uploadPDF,
  listPDFs,
  getPDF,
  getPresignedUrl,
  deletePDF,
  updatePDF,
} from "../controllers/pdf.controller.js";
import { getLocalFilePath } from "../services/storage.service.js";

const router = Router();

// Multer: store in memory (buffer), then hand off to storage service
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") return cb(null, true);
    cb(new Error("Only PDF files are allowed"));
  },
});

router.get("/", listPDFs);
router.post("/", upload.single("file"), uploadPDF);
router.get("/:id", getPDF);
router.get("/:id/download-url", getPresignedUrl);
router.patch("/:id", updatePDF);
router.delete("/:id", deletePDF);

// ── Local file serving (dev only) ────────────────────────────────────────────
router.get("/local/:flatKey", (req, res) => {
  const filePath = getLocalFilePath(decodeURIComponent(req.params.flatKey));
  if (!existsSync(filePath)) return res.status(404).send("Not found");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline");
  res.sendFile(filePath);
});

export default router;
