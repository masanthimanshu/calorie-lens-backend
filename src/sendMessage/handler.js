import { sendMessage } from "./service.js";
import { logger } from "#core/cloudwatch_logs.js";

export const handler = async (event) => {
  try {
    for (const record of event.Records) {
      const data = record.body;

      if (data) {
        logger.info(`Processing notification for data: ${data}`);
        await sendMessage(data);
      }
    }
  } catch (error) {
    logger.error("Error processing SQS event:", { error });
    throw error;
  }
};
