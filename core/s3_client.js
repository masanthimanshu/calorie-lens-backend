import { randomUUID } from "node:crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.CURRENT_AWS_REGION });

export async function generateImageUploadUrl() {
  const key = `images/${randomUUID()}.png`;

  const command = new PutObjectCommand({
    Key: key,
    ContentType: "image/png",
    Bucket: process.env.BUCKET_NAME,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, key };
}

export async function getImageFromS3(key) {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: process.env.BUCKET_NAME,
  });

  const response = await s3Client.send(command);

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}
