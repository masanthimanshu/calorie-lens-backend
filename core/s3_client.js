import { randomUUID } from "node:crypto";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({ region: process.env.CURRENT_AWS_REGION });

export async function generateUploadUrl() {
  const key = `images/${randomUUID()}.png`;

  const command = new PutObjectCommand({
    Key: key,
    ContentType: "image/png",
    Bucket: process.env.BUCKET_NAME,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return { uploadUrl, key };
}
