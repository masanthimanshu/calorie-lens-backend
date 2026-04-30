import { processImage } from "./service.js";
import { logger } from "#core/runtime_logs.js";

export const handler = async (event) => {
  try {
    const record = event.Records[0];
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key);

    logger.info("Processing image:", { bucket, key });

    await processImage({ bucket, key });
  } catch (error) {
    logger.error("Error processing image:", { error });
    throw error;
  }
};
