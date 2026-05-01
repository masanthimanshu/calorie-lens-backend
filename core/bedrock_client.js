import { getParameterValue } from "#core/parameter_store.js";
import {
  InvokeModelCommand,
  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";

const llmClient = new BedrockRuntimeClient({
  region: process.env.CURRENT_AWS_REGION || "us-east-1",
});

async function getModelConfig() {
  const [modelArn, systemPrompt] = await Promise.all([
    getParameterValue("/ai/claude-model-arn"),
    getParameterValue("/calorie-lens/lambda/system-prompt"),
  ]);

  return { modelArn, systemPrompt };
}

export async function invokeModel(base64Image, dishName) {
  const { modelArn, systemPrompt } = await getModelConfig();

  const command = new InvokeModelCommand({
    modelId: modelArn,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      max_tokens: 500,
      system: [{ text: systemPrompt }],
      messages: [
        {
          role: "user",
          content: [
            { text: `The Dish Name is: ${dishName}` },
            {
              image: {
                format: "webp",
                source: { bytes: base64Image },
              },
            },
          ],
        },
      ],
    }),
  });

  const res = await llmClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(res.body));

  return result.output.message.content[0].text;
}
