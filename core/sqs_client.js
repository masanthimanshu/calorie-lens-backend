import { logger } from "#core/cloudwatch_logs.js";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: process.env.CURRENT_AWS_REGION });

export async function sendMessage(message) {
  const params = {
    QueueUrl: process.env.QUEUE_URL,
    MessageBody:
      typeof message === "string" ? message : JSON.stringify(message),
  };

  try {
    return await sqsClient.send(new SendMessageCommand(params));
  } catch (error) {
    logger.error("Error sending message to SQS", { error: error.message });
    throw error;
  }
}
