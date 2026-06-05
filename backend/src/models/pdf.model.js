import mongoose from "mongoose";

const pdfSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    size: { type: Number, required: true },          // bytes
    mimeType: { type: String, default: "application/pdf" },
    storageKey: { type: String, required: true },    // S3 / R2 object key
    downloadCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    isPublic: { type: Boolean, default: true },
    uploadedBy: { type: String, default: "admin" },  // extend with auth later
  },
  { timestamps: true }
);

// Text-search index
pdfSchema.index({ name: "text", description: "text", tags: "text" });

export const PDF = mongoose.model("PDF", pdfSchema);
