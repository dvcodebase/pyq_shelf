import { BookOpen, Upload } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { pathname } = useLocation();

  return (
    <header className="border-b border-ink/10 bg-cream/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-ink rounded flex items-center justify-center">
            <BookOpen size={15} className="text-cream" />
          </div>
          <span className="font-display text-xl tracking-tight">JUET PYQ Shelf</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === "/"
                ? "bg-ink text-cream"
                : "text-muted hover:text-ink hover:bg-ink/5"
            }`}
          >
            Library
          </Link>
          <Link
            to="/upload"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              pathname === "/upload"
                ? "bg-ink text-cream"
                : "text-muted hover:text-ink hover:bg-ink/5"
            }`}
          >
            <Upload size={14} />
            Upload
          </Link>
        </nav>
      </div>
    </header>
  );
}
