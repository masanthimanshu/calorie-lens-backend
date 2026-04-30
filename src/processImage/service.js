import { getImageFromS3 } from "#core/s3_client.js";
import { invokeModel } from "#core/bedrock_client.js";

export async function processImage(key) {
  const imageBuffer = await getImageFromS3(key);
  const result = await invokeModel(imageBuffer);

  return result;
}
