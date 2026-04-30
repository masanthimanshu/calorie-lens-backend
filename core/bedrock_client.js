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
    modelId: "google.gemma-3-12b-it",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      system_instruction: { text: systemPrompt },
      messages: [
        {
          role: "user",
          content: [{ image: { format: "png", data: base64Image } }],
        },
      ],
    }),
  });

  const res = await llmClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(res.body));

  return JSON.parse(result.choices[0].message.content);
}
