# PDF Shelf 📚

A scalable PDF management platform — upload, preview, download, and organize PDF documents.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| State | TanStack Query (server) + Zustand (client) |
| PDF Viewer | react-pdf (PDF.js) |
| Backend | Node.js + Express (ESM) |
| Database | MongoDB + Mongoose |
| Storage | AWS S3 / Cloudflare R2 / Local filesystem |
| Auth-ready | Extendable middleware layer |
| Deployment | Docker + nginx |

---

## Project Structure

```
pdf-platform/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry
│   │   ├── db.js                 # MongoDB connection
│   │   ├── models/pdf.model.js   # Mongoose schema
│   │   ├── services/storage.service.js  # S3/R2/local abstraction
│   │   ├── controllers/pdf.controller.js
│   │   └── routes/pdf.routes.js
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # App entry + providers
│   │   ├── components/           # Header, PDFCard, UploadZone, PDFViewer
│   │   ├── pages/                # HomePage, UploadPage, PDFDetailPage
│   │   ├── lib/                  # api.ts, uploadStore.ts, utils.ts
│   │   └── types/index.ts
│   ├── nginx.conf
│   └── Dockerfile
└── docker-compose.yml
```

---

## Quick Start (Local Dev)

### 1. Backend

```bash
cd backend
cp .env.example .env          # Edit values
npm install
npm run dev                   # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### 3. Docker (Full Stack)

```bash
# From repo root
docker-compose up --build
# App: http://localhost:80
```

---

## Storage Options

### Local (default / dev)
```env
STORAGE_PROVIDER=local
```
Files saved to `backend/uploads/`. Served via Express for dev.

### AWS S3
```env
STORAGE_PROVIDER=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket
```

### Cloudflare R2
```env
STORAGE_PROVIDER=r2
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_ENDPOINT_URL=https://<account_id>.r2.cloudflarestorage.com
S3_BUCKET_NAME=your-bucket
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pdfs` | List PDFs (search, pagination) |
| POST | `/api/pdfs` | Upload PDF (multipart/form-data) |
| GET | `/api/pdfs/:id` | Get single PDF metadata |
| GET | `/api/pdfs/:id/download-url` | Get presigned/local download URL |
| PATCH | `/api/pdfs/:id` | Update name/description/tags |
| DELETE | `/api/pdfs/:id` | Delete PDF + storage object |

### Upload Form Fields
| Field | Type | Required |
|---|---|---|
| `file` | File (PDF) | ✅ |
| `name` | string | No |
| `description` | string | No |
| `tags` | string (comma-separated) | No |

---

## Scaling Notes

- **Horizontal scaling**: Backend is stateless — run multiple instances behind a load balancer
- **Storage**: S3/R2 with presigned URLs means files never proxy through your servers
- **Database**: MongoDB Atlas for managed, scaled Mongo
- **CDN**: Point CloudFront / Cloudflare in front of S3/R2 for fast global delivery
- **Auth**: Add JWT middleware to routes; `uploadedBy` field is already in the schema
- **Queue**: For large files, swap direct upload for a job queue (BullMQ + Redis)
