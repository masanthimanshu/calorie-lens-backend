import { logger } from "#core/runtime_logs.js";

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const newImage = record.dynamodb.NewImage;

      const data = newImage.result.S;
      logger.info(`Received new message: ${data}`);
    }
  }
};
