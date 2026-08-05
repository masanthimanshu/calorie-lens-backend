import { logger } from "#core/runtime_logs.js";

export async function sendMessage(message) {
  logger.info(`Sending message: ${message}`);
}
