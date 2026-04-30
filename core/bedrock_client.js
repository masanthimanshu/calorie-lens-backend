import { getParameterValue } from "#core/parameter_store.js";
import {
  InvokeModelCommand,
  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = await getParameterValue(
  "/calorie-lens/lambda/system-prompt",
);

const llmClient = new BedrockRuntimeClient({
  region: process.env.CURRENT_AWS_REGION,
});

export async function invokeModel(imageBuffer) {
  const base64Image = imageBuffer.toString("base64");

  const command = new InvokeModelCommand({
    modelId: "amazon.nova-lite-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText: systemPrompt,
      inputImage: base64Image,
    }),
  });

  const res = await llmClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(res.body));

  if (result.outputText) {
    try {
      return JSON.parse(result.outputText);
    } catch {
      return result.outputText;
    }
  }

  return result;
}
