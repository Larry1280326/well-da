import "server-only";

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const PRESIGNED_URL_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function generateS3Key(fileName: string): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uuid = crypto.randomUUID();
  const sanitized = sanitizeFileName(fileName);
  return `rfq-uploads/${yearMonth}/${uuid}-${sanitized}`;
}

export async function uploadFile(
  buffer: Buffer,
  fileName: string,
  contentType: string,
): Promise<{ url: string; key: string; bucket: string }> {
  const client = getS3Client();
  const bucket = process.env.S3_BUCKET_NAME!;
  const key = generateS3Key(fileName);

  // Sign first, so a signing failure cannot leave an uploaded object untracked.
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS },
  );

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: `attachment; filename="${sanitizeFileName(fileName)}"`,
    }),
  );

  return { url, key, bucket };
}

export async function deleteFile(key: string): Promise<void> {
  const client = getS3Client();
  const bucket = process.env.S3_BUCKET_NAME!;
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

// Stored presigned links expire after seven days. Re-sign only keys in our configured
// RFQ bucket when an authenticated administrator opens the existing RFQ detail page.
export async function refreshRfqFileUrl(storedUrl: string): Promise<string> {
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.S3_REGION;
  if (!bucket || !region) return storedUrl;
  let url: URL;
  try { url = new URL(storedUrl); } catch { return storedUrl; }
  if (url.protocol !== "https:") return storedUrl;
  let key: string;
  if ([`${bucket}.s3.${region}.amazonaws.com`, `${bucket}.s3.amazonaws.com`].includes(url.hostname)) {
    key = decodeURIComponent(url.pathname.slice(1));
  } else if (url.hostname === `s3.${region}.amazonaws.com` && url.pathname.startsWith(`/${bucket}/`)) {
    key = decodeURIComponent(url.pathname.slice(bucket.length + 2));
  } else return storedUrl;
  if (!key.startsWith("rfq-uploads/")) return storedUrl;
  return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: PRESIGNED_URL_EXPIRY_SECONDS });
}
