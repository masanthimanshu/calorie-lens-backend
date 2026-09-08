import axios from "axios";
import { logger } from "#core/cloudwatch_logs.js";
import { getParameterValue } from "#core/parameter_store.js";
import { invokeModelForText } from "#core/bedrock_client.js";

export async function sendMessage(data) {
  try {
    const [botToken, chatId] = await Promise.all([
      getParameterValue("/calorie-lens/telegram/bot-token"),
      getParameterValue("/calorie-lens/telegram/chat-id"),
    ]);

    const formattedMessage = await invokeModelForText(
      `Format the following calorie analysis result into a clear and friendly message:\n${data}`,
    );

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text: formattedMessage,
      parse_mode: "Markdown",
    });

    logger.info(`Telegram notification sent successfully for data: ${data}`);
  } catch (error) {
    logger.error("Failed to send Telegram message", { error: error.message });
    throw error;
  }
}
