import sharp from "sharp";

export async function optimizeImage(buffer) {
  const resized = sharp(buffer).resize({ width: 512 });
  const optimized = resized.webp({ quality: 75 });

  return optimized.toBuffer();
}
