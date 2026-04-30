import { processImage } from "./service.js";
import { logger } from "#core/runtime_logs.js";
import { writeData } from "#core/dynamo_client.js";

export const handler = async (event) => {
  try {
    const record = event.Records[0];
    const key = decodeURIComponent(record.s3.object.key);

    logger.info("Processing image:", { key });

    const result = await processImage(key);
    await writeData({ key, result });

    logger.info("Image processed successfully:", { key, result });
  } catch (error) {
    logger.error("Error processing image:", { error });
    throw error;
  }
};
