import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, BookOpen, SlidersHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import PDFCard from "../components/PDFCard";
import { fetchPDFs, deletePDF } from "../lib/api";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const qc = useQueryClient();

  // Simple debounce
  let debounceTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["pdfs", debouncedSearch],
    queryFn: () => fetchPDFs({ search: debouncedSearch }),
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePDF,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pdfs"] });
      toast.success("Deleted");
    },
    onError: () => toast.error("Delete failed"),
  });

  const pdfs = data?.pdfs ?? [];
  const total = data?.pagination.total ?? 0;

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="font-display text-5xl text-ink mb-2">
          Your Document{" "}
          <span className="italic text-rust">Shelf</span>
        </h1>
        <p className="text-muted text-lg">
          {total > 0 ? `${total} document${total !== 1 ? "s" : ""} archived` : "No documents yet — upload your first PDF"}
        </p>
      </section>

      {/* Search */}
      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, tags, or description…"
            className="w-full pl-10 pr-4 py-3 bg-cream border border-ink/15 rounded-2xl text-sm focus:outline-none focus:border-rust transition-colors"
          />
        </div>
        <button className="p-3 bg-cream border border-ink/15 rounded-2xl text-muted hover:text-ink hover:border-ink/30 transition-colors">
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 bg-cream border border-ink/10 rounded-2xl animate-pulse"
              style={{ animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-muted mb-2">Couldn't reach the server</p>
          <p className="text-muted text-sm">Make sure the backend is running on port 4000.</p>
        </div>
      )}

      {!isLoading && !isError && pdfs.length === 0 && (
        <div className="text-center py-24">
          <BookOpen size={48} className="mx-auto text-muted/40 mb-4" />
          <p className="font-display text-2xl text-ink mb-2">
            {debouncedSearch ? "No results found" : "Your shelf is empty"}
          </p>
          <p className="text-muted text-sm">
            {debouncedSearch
              ? "Try a different search term"
              : "Upload your first PDF to get started"}
          </p>
        </div>
      )}

      {!isLoading && pdfs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <PDFCard key={pdf.id} pdf={pdf} onDelete={(id) => deleteMutation.mutate(id)} />
          ))}
        </div>
      )}
    </main>
  );
}
