import sharp from "sharp";

export async function optimizeImage(buffer) {
  const resized = await sharp(buffer).resize({ width: 512 });
  const optimized = await resized.webp({ quality: 75 });

  return optimized.toBuffer();
}
