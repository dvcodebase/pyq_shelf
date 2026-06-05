export interface PDF {
  id: string;
  name: string;
  description: string;
  size: number;
  tags: string[];
  downloadCount: number;
  isPublic: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse {
  pdfs: PDF[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "done" | "error";
}
