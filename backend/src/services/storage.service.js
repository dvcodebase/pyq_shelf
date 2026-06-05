/**
 * Storage Service
 * Supports: AWS S3, Cloudflare R2 (S3-compatible), Local filesystem
 *
 * Set STORAGE_PROVIDER=s3 | r2 | local in .env
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createWriteStream, createReadStream, existsSync, mkdirSync, unlinkSync } from "fs";
import { join } from "path";
import { pipeline } from "stream/promises";

const PROVIDER = process.env.STORAGE_PROVIDER || "local";
const BUCKET = process.env.S3_BUCKET_NAME || "pdf-platform";
const EXPIRY = Number(process.env.PRESIGNED_URL_EXPIRY) || 3600;
const LOCAL_DIR = join(process.cwd(), "uploads");

// ─── S3 / R2 Client ───────────────────────────────────────────────────────────
const makeS3Client = () => {
  const config = {
    region: process.env.AWS_REGION || "auto",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };
  // Cloudflare R2 needs a custom endpoint
  if (process.env.AWS_ENDPOINT_URL) {
    config.endpoint = process.env.AWS_ENDPOINT_URL;
    config.forcePathStyle = true;
  }
  return new S3Client(config);
};

let s3;
if (PROVIDER === "s3" || PROVIDER === "r2") {
  s3 = makeS3Client();
}

if (PROVIDER === "local" && !existsSync(LOCAL_DIR)) {
  mkdirSync(LOCAL_DIR, { recursive: true });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Upload a file buffer/stream to the configured storage.
 * @param {string} key   - Unique object key (e.g. "pdfs/uuid.pdf")
 * @param {Buffer} buffer
 * @param {string} contentType
 */
export const uploadFile = async (key, buffer, contentType) => {
  if (PROVIDER === "local") {
    const dest = join(LOCAL_DIR, key.replace(/\//g, "_"));
    await new Promise((res, rej) => {
      const ws = createWriteStream(dest);
      ws.write(buffer);
      ws.end();
      ws.on("finish", res);
      ws.on("error", rej);
    });
    return { key };
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return { key };
};

/**
 * Generate a pre-signed download URL (or local path URL).
 */
export const getDownloadUrl = async (key) => {
  if (PROVIDER === "local") {
    // In production behind a real server you'd serve this with express.static
    return `/api/pdfs/local/${encodeURIComponent(key.replace(/\//g, "_"))}`;
  }

  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, command, { expiresIn: EXPIRY });
};

/**
 * Delete an object.
 */
export const deleteFile = async (key) => {
  if (PROVIDER === "local") {
    const dest = join(LOCAL_DIR, key.replace(/\//g, "_"));
    if (existsSync(dest)) unlinkSync(dest);
    return;
  }

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

export const getLocalFilePath = (flatKey) =>
  join(LOCAL_DIR, flatKey);
