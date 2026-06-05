import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { uploadPDF } from "../lib/api";
import { formatBytes } from "../lib/utils";

interface FileMeta {
  file: File;
  name: string;
  description: string;
  tags: string;
}

export default function UploadZone() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<FileMeta[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<Record<string, "idle" | "uploading" | "done" | "error">>({});
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const newItems: FileMeta[] = accepted.map((f) => ({
      file: f,
      name: f.name.replace(/\.pdf$/i, ""),
      description: "",
      tags: "",
    }));
    setQueue((q) => [...q, ...newItems]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    maxSize: 50 * 1024 * 1024,
  });

  const updateMeta = (idx: number, field: keyof FileMeta, val: string) => {
    setQueue((q) => q.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const removeFromQueue = (idx: number) => {
    setQueue((q) => q.filter((_, i) => i !== idx));
  };

  const handleUploadAll = async () => {
    if (queue.length === 0) return;
    setIsUploading(true);

    for (const item of queue) {
      const key = item.file.name;
      setStatus((s) => ({ ...s, [key]: "uploading" }));
      try {
        await uploadPDF(
          item.file,
          { name: item.name, description: item.description, tags: item.tags },
          (pct) => setProgress((p) => ({ ...p, [key]: pct }))
        );
        setStatus((s) => ({ ...s, [key]: "done" }));
      } catch {
        setStatus((s) => ({ ...s, [key]: "error" }));
      }
    }

    setIsUploading(false);
    const doneCount = queue.filter((i) => status[i.file.name] !== "error").length;
    if (doneCount > 0) {
      toast.success(`${queue.length} PDF${queue.length > 1 ? "s" : ""} uploaded!`);
      setTimeout(() => navigate("/"), 800);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? "border-rust bg-rust/5 scale-[1.01]"
            : "border-ink/20 hover:border-ink/40 bg-cream/50"
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud
          size={40}
          className={`mx-auto mb-4 ${isDragActive ? "text-rust" : "text-muted"}`}
        />
        {isDragActive ? (
          <p className="font-display text-xl text-rust">Drop to add to shelf…</p>
        ) : (
          <>
            <p className="font-display text-xl text-ink">Drop PDFs here</p>
            <p className="text-muted text-sm mt-1">or click to browse · Max 50 MB per file</p>
          </>
        )}
      </div>

      {/* Queue */}
      {queue.length > 0 && (
        <div className="space-y-4">
          {queue.map((item, idx) => {
            const key = item.file.name;
            const pct = progress[key] ?? 0;
            const st = status[key] ?? "idle";

            return (
              <div
                key={`${key}-${idx}`}
                className="bg-cream border border-ink/10 rounded-2xl p-5 animate-fade-up"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-11 bg-rust/10 rounded-lg flex items-center justify-center shrink-0 border border-rust/20">
                    <FileText size={16} className="text-rust" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-muted truncate">{item.file.name}</p>
                    <p className="text-xs text-muted">{formatBytes(item.file.size)}</p>
                  </div>
                  {st === "done" && <CheckCircle2 size={18} className="text-green-600 shrink-0" />}
                  {st === "error" && <AlertCircle size={18} className="text-red-600 shrink-0" />}
                  {st === "idle" && (
                    <button onClick={() => removeFromQueue(idx)} className="text-muted hover:text-ink">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Progress bar */}
                {st === "uploading" && (
                  <div className="mb-4 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rust rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}

                {/* Metadata fields */}
                {st === "idle" && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs text-muted mb-1 font-mono">Title</label>
                      <input
                        value={item.name}
                        onChange={(e) => updateMeta(idx, "name", e.target.value)}
                        className="w-full bg-paper border border-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rust transition-colors"
                        placeholder="Document title"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted mb-1 font-mono">Tags</label>
                      <input
                        value={item.tags}
                        onChange={(e) => updateMeta(idx, "tags", e.target.value)}
                        className="w-full bg-paper border border-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rust transition-colors"
                        placeholder="math, physics, 2024"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-muted mb-1 font-mono">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateMeta(idx, "description", e.target.value)}
                        rows={2}
                        className="w-full bg-paper border border-ink/15 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-rust transition-colors resize-none"
                        placeholder="Optional description…"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={handleUploadAll}
            disabled={isUploading}
            className="w-full py-3 bg-ink text-cream rounded-2xl font-medium hover:bg-rust disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <span className="animate-pulse">Uploading…</span>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload {queue.length} file{queue.length > 1 ? "s" : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
