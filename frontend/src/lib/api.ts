import axios from "axios";
import type { PDF, PaginatedResponse } from "../types";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

// ─── PDFs ─────────────────────────────────────────────────────────────────────

export const fetchPDFs = async (params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse> => {
  const { data } = await api.get("/pdfs", { params });
  return data;
};

export const fetchPDF = async (id: string): Promise<PDF> => {
  const { data } = await api.get(`/pdfs/${id}`);
  return data;
};

export const uploadPDF = async (
  file: File,
  meta: { name?: string; description?: string; tags?: string },
  onProgress?: (pct: number) => void
): Promise<PDF> => {
  const fd = new FormData();
  fd.append("file", file);
  if (meta.name) fd.append("name", meta.name);
  if (meta.description) fd.append("description", meta.description);
  if (meta.tags) fd.append("tags", meta.tags);

  const { data } = await api.post("/pdfs", fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.pdf;
};

export const getDownloadUrl = async (id: string): Promise<string> => {
  const { data } = await api.get(`/pdfs/${id}/download-url`);
  return data.url;
};

export const deletePDF = async (id: string): Promise<void> => {
  await api.delete(`/pdfs/${id}`);
};

export const updatePDF = async (
  id: string,
  payload: { name?: string; description?: string; tags?: string }
): Promise<PDF> => {
  const { data } = await api.patch(`/pdfs/${id}`, payload);
  return data;
};
