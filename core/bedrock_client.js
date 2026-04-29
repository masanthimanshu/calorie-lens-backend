import { getParameterValue } from "#core/parameter_store.js";
import messages from "#data/messages.json" with { type: "json" };
import {
  InvokeModelCommand,
  BedrockRuntimeClient,
} from "@aws-sdk/client-bedrock-runtime";

const systemPrompt = await getParameterValue("/nfc-message/lambda/message");

const llmClient = new BedrockRuntimeClient({
  region: process.env.CURRENT_AWS_REGION,
});

export async function invokeModel(prompt) {
  const command = new InvokeModelCommand({
    modelId: "google.gemma-3-4b-it",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      system_instruction: { text: systemPrompt },
      messages: [...messages, { role: "user", content: prompt }],
    }),
  });

  const res = await llmClient.send(command);
  const result = JSON.parse(new TextDecoder().decode(res.body));

  return result.choices[0].message.content;
}
