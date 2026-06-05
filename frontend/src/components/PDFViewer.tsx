import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Use local worker from pdfjs-dist
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  url: string;
}

export default function PDFViewer({ url }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNum, setPageNum] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);

  const onDocumentLoad = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNum(1);
  }, []);

  return (
    <div className="flex flex-col items-center gap-0">
      {/* Toolbar */}
      <div className="sticky top-16 z-30 w-full bg-cream/90 backdrop-blur border-b border-ink/10 flex items-center justify-center gap-2 px-4 py-2">
        <button
          onClick={() => setPageNum((p) => Math.max(1, p - 1))}
          disabled={pageNum <= 1}
          className="p-2 rounded-lg hover:bg-ink/5 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="font-mono text-sm tabular-nums">
          {pageNum} / {numPages}
        </span>

        <button
          onClick={() => setPageNum((p) => Math.min(numPages, p + 1))}
          disabled={pageNum >= numPages}
          className="p-2 rounded-lg hover:bg-ink/5 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={18} />
        </button>

        <div className="w-px h-5 bg-ink/15 mx-1" />

        <button
          onClick={() => setScale((s) => Math.min(3, s + 0.2))}
          className="p-2 rounded-lg hover:bg-ink/5 transition-colors"
        >
          <ZoomIn size={18} />
        </button>

        <span className="font-mono text-xs w-10 text-center text-muted">
          {Math.round(scale * 100)}%
        </span>

        <button
          onClick={() => setScale((s) => Math.max(0.4, s - 0.2))}
          className="p-2 rounded-lg hover:bg-ink/5 transition-colors"
        >
          <ZoomOut size={18} />
        </button>

        <div className="w-px h-5 bg-ink/15 mx-1" />

        <button
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="p-2 rounded-lg hover:bg-ink/5 transition-colors"
        >
          <RotateCw size={18} />
        </button>
      </div>

      {/* Document */}
      <div className="w-full overflow-x-auto flex justify-center py-6 bg-muted/10 min-h-screen">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoad}
          loading={
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-ink border-t-transparent" />
            </div>
          }
          error={
            <div className="text-center py-20 text-muted">
              <p className="font-display text-xl mb-2">Couldn't load PDF</p>
              <p className="text-sm">The file may have moved or expired.</p>
            </div>
          }
        >
          <Page
            pageNumber={pageNum}
            scale={scale}
            rotate={rotation}
            className="shadow-2xl shadow-ink/15"
            renderTextLayer
            renderAnnotationLayer
          />
        </Document>
      </div>
    </div>
  );
}
