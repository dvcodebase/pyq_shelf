import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  FileText,
  Tag,
  Calendar,
  User,
  BarChart2,
  Eye,
} from "lucide-react";
import { fetchPDF, getDownloadUrl } from "../lib/api";
import PDFViewer from "../components/PDFViewer";
import { formatBytes, formatDate } from "../lib/utils";

export default function PDFDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const { data: pdf, isLoading } = useQuery({
    queryKey: ["pdf", id],
    queryFn: () => fetchPDF(id!),
    enabled: !!id,
  });

  const handlePreview = async () => {
    if (!id) return;
    setLoadingPreview(true);
    try {
      const url = await getDownloadUrl(id);
      setPreviewUrl(url);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async () => {
    if (!id || !pdf) return;
    const url = await getDownloadUrl(id);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pdf.name}.pdf`;
    a.click();
  };

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="h-8 w-48 bg-ink/10 rounded-lg animate-pulse mb-8" />
        <div className="h-64 bg-ink/5 rounded-2xl animate-pulse" />
      </main>
    );
  }

  if (!pdf) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10 text-center">
        <p className="font-display text-2xl text-muted">Document not found</p>
        <Link to="/" className="text-rust text-sm mt-4 inline-block hover:underline">
          ← Back to library
        </Link>
      </main>
    );
  }

  return (
    <div>
      {/* Detail header */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-ink text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Library
        </Link>

        <div className="flex items-start gap-5">
          <div className="w-14 h-16 bg-rust/10 rounded-xl flex items-center justify-center border border-rust/20 shrink-0">
            <FileText size={24} className="text-rust" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl text-ink mb-1">{pdf.name}</h1>
            {pdf.description && (
              <p className="text-muted text-sm max-w-xl">{pdf.description}</p>
            )}

            {/* Tags */}
            {pdf.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {pdf.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber/10 text-amber rounded-full text-xs font-mono"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Meta grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 p-5 bg-cream border border-ink/10 rounded-2xl">
          {[
            { icon: FileText, label: "Size", value: formatBytes(pdf.size) },
            { icon: Calendar, label: "Uploaded", value: formatDate(pdf.createdAt) },
            { icon: User, label: "By", value: pdf.uploadedBy },
            { icon: BarChart2, label: "Downloads", value: String(pdf.downloadCount) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-ink/5 rounded-lg flex items-center justify-center">
                <Icon size={14} className="text-muted" />
              </div>
              <div>
                <p className="text-xs text-muted font-mono">{label}</p>
                <p className="text-sm font-medium text-ink">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handlePreview}
            disabled={loadingPreview || !!previewUrl}
            className="flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-xl text-sm font-medium hover:bg-rust disabled:opacity-50 transition-colors"
          >
            <Eye size={15} />
            {previewUrl ? "Previewing" : loadingPreview ? "Loading…" : "Preview PDF"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 bg-cream border border-ink/15 rounded-xl text-sm font-medium hover:border-rust hover:text-rust transition-colors"
          >
            <Download size={15} />
            Download
          </button>
        </div>
      </div>

      {/* Inline PDF viewer */}
      {previewUrl && <PDFViewer url={previewUrl} />}
    </div>
  );
}
