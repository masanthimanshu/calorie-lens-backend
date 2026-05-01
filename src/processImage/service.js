import { logger } from "#core/runtime_logs.js";
import { cleanJson } from "#utils/clean_json.js";
import { getImageFromS3 } from "#core/s3_client.js";
import { invokeModel } from "#core/bedrock_client.js";
import { optimizeImage } from "#utils/optimize_image.js";

export async function processImage(key) {
  try {
    const s3Data = await getImageFromS3(key);

    const optimizedBuffer = await optimizeImage(s3Data.buffer);
    const base64Image = optimizedBuffer.toString("base64");

    const result = await invokeModel(base64Image, s3Data.dish);

    return cleanJson(result);
  } catch (error) {
    logger.error("Failed to process image", { key, error: error.message });
    throw error;
  }
}
