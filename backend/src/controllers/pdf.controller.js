import { v4 as uuidv4 } from "uuid";
import { PDF } from "../models/pdf.model.js";
import { uploadFile, getDownloadUrl, deleteFile } from "../services/storage.service.js";

// ─── Upload ───────────────────────────────────────────────────────────────────
export const uploadPDF = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const id = uuidv4();
    const ext = ".pdf";
    const storageKey = `pdfs/${id}${ext}`;

    await uploadFile(storageKey, req.file.buffer, "application/pdf");

    const { name, description, tags } = req.body;

    const doc = await PDF.create({
      id,
      name: name || req.file.originalname.replace(/\.pdf$/i, ""),
      description: description || "",
      size: req.file.size,
      storageKey,
      tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });

    res.status(201).json({ success: true, pdf: sanitize(doc) });
  } catch (err) {
    next(err);
  }
};

// ─── List ─────────────────────────────────────────────────────────────────────
export const listPDFs = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$text = { $search: search };

    const [docs, total] = await Promise.all([
      PDF.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      PDF.countDocuments(query),
    ]);

    res.json({
      pdfs: docs.map(sanitize),
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get single ───────────────────────────────────────────────────────────────
export const getPDF = async (req, res, next) => {
  try {
    const doc = await PDF.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(sanitize(doc));
  } catch (err) {
    next(err);
  }
};

// ─── Download URL ─────────────────────────────────────────────────────────────
export const getPresignedUrl = async (req, res, next) => {
  try {
    const doc = await PDF.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: "Not found" });

    const url = await getDownloadUrl(doc.storageKey);

    // Increment download counter (fire-and-forget)
    PDF.updateOne({ id: doc.id }, { $inc: { downloadCount: 1 } }).exec();

    res.json({ url });
  } catch (err) {
    next(err);
  }
};

// ─── Delete ───────────────────────────────────────────────────────────────────
export const deletePDF = async (req, res, next) => {
  try {
    const doc = await PDF.findOne({ id: req.params.id });
    if (!doc) return res.status(404).json({ error: "Not found" });

    await deleteFile(doc.storageKey);
    await PDF.deleteOne({ id: doc.id });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// ─── Update metadata ─────────────────────────────────────────────────────────
export const updatePDF = async (req, res, next) => {
  try {
    const { name, description, tags } = req.body;
    const update = {};
    if (name) update.name = name;
    if (description !== undefined) update.description = description;
    if (tags) update.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);

    const doc = await PDF.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json(sanitize(doc));
  } catch (err) {
    next(err);
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const sanitize = (doc) => ({
  id: doc.id,
  name: doc.name,
  description: doc.description,
  size: doc.size,
  tags: doc.tags,
  downloadCount: doc.downloadCount,
  isPublic: doc.isPublic,
  uploadedBy: doc.uploadedBy,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});
