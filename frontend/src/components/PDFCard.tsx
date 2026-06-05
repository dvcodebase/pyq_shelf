import { Download, Eye, Trash2, FileText, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import type { PDF } from "../types";
import { formatBytes, formatDate } from "../lib/utils";

interface Props {
  pdf: PDF;
  onDelete?: (id: string) => void;
}

export default function PDFCard({ pdf, onDelete }: Props) {
  return (
    <article className="group relative bg-cream border border-ink/10 rounded-2xl p-5 hover:border-ink/25 hover:shadow-lg hover:shadow-ink/5 transition-all duration-300 animate-fade-up flex flex-col gap-4">
      {/* Icon + name */}
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-10 h-12 bg-rust/10 rounded-lg flex items-center justify-center border border-rust/20">
          <FileText size={18} className="text-rust" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-tight text-ink line-clamp-2 group-hover:text-rust transition-colors">
            {pdf.name}
          </h3>
          {pdf.description && (
            <p className="text-xs text-muted mt-1 line-clamp-2">{pdf.description}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      {pdf.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {pdf.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber/10 text-amber rounded-full text-xs font-mono"
            >
              <Tag size={9} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center justify-between text-xs text-muted border-t border-ink/5 pt-3">
        <span className="font-mono">{formatBytes(pdf.size)}</span>
        <span>{formatDate(pdf.createdAt)}</span>
        <span className="flex items-center gap-1">
          <Download size={10} />
          {pdf.downloadCount}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          to={`/pdf/${pdf.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-ink text-cream rounded-xl text-sm font-medium hover:bg-rust transition-colors"
        >
          <Eye size={14} />
          Preview
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(pdf.id)}
            className="p-2 rounded-xl text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
}
