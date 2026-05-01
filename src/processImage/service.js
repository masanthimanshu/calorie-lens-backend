import { cleanJson } from "#utils/clean_json.js";
import { getImageFromS3 } from "#core/s3_client.js";
import { invokeModel } from "#core/bedrock_client.js";
import { optimizeImage } from "#utils/optimize_image.js";

export async function processImage(key) {
  const imageBuffer = await getImageFromS3(key);

  const optimizedBuffer = await optimizeImage(imageBuffer);
  const base64Image = optimizedBuffer.toString("base64");

  const result = await invokeModel(base64Image);

  return cleanJson(result);
}
