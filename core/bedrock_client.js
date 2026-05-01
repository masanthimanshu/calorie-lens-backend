import { optimizeImage } from "#utils/optimize_image.js";
import { getParameterValue } from "#core/parameter_store.js";
import {
  InvokeModelCommand,
  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";

const modelArn = await getParameterValue("/ai/claude-model-arn");

const systemPrompt = await getParameterValue(
  "/calorie-lens/lambda/system-prompt",
);

const llmClient = new BedrockRuntimeClient({
  region: process.env.CURRENT_AWS_REGION,
});

export async function invokeModel(imageBuffer) {
  const optimizedBuffer = await optimizeImage(imageBuffer);
  const base64Image = optimizedBuffer.toString("base64");

  const command = new InvokeModelCommand({
    modelId: modelArn,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            {
              type: "image",
              source: {
                type: "base64",
                data: base64Image,
                media_type: "image/webp",
              },
            },
          ],
        },
      ],
    }),
  });

  const res = await llmClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(res.body));

  return result;
}
