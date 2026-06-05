import { create } from "zustand";

interface UploadJob {
  id: string;
  fileName: string;
  progress: number;
  status: "uploading" | "done" | "error";
  error?: string;
}

interface UploadStore {
  jobs: UploadJob[];
  addJob: (id: string, fileName: string) => void;
  updateProgress: (id: string, progress: number) => void;
  markDone: (id: string) => void;
  markError: (id: string, error: string) => void;
  removeJob: (id: string) => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  jobs: [],
  addJob: (id, fileName) =>
    set((s) => ({
      jobs: [...s.jobs, { id, fileName, progress: 0, status: "uploading" }],
    })),
  updateProgress: (id, progress) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, progress } : j)),
    })),
  markDone: (id) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: "done", progress: 100 } : j)),
    })),
  markError: (id, error) =>
    set((s) => ({
      jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: "error", error } : j)),
    })),
  removeJob: (id) =>
    set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
}));
