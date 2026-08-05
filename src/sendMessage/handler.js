import { sendMessage } from "./service.js";

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName === "INSERT") {
      const newImage = record.dynamodb.NewImage;

      const data = newImage.result.S;
      sendMessage(data);
    }
  }
};
