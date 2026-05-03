import { logger } from "#core/runtime_logs.js";

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const data = record.dynamodb.NewImage;
      logger.info("New Image: ", data);
    }
  }
};
