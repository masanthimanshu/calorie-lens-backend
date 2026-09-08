import { sendMessage } from "./service.js";
import { logger } from "#core/cloudwatch_logs.js";

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      if (record.eventName === "INSERT") {
        const newImage = record.dynamodb?.NewImage;
        const data = newImage?.result?.S;

        if (data) {
          logger.info(`Processing notification for data: ${data}`);
          await sendMessage(data);
        }
      }
    }
  } catch (error) {
    logger.error("Error processing stream event:", { error });
    throw error;
  }
};
