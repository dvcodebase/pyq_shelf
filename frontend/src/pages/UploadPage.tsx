import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import UploadZone from "../components/UploadZone";

export default function UploadPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted hover:text-ink text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={14} /> Back to library
      </Link>

      <h1 className="font-display text-4xl text-ink mb-2">
        Add to <span className="italic text-rust">Shelf</span>
      </h1>
      <p className="text-muted mb-8">Upload one or more PDF files with metadata.</p>

      <UploadZone />
    </main>
  );
}
