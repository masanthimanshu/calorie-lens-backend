import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssmClient = new SSMClient({ region: process.env.CURRENT_AWS_REGION });

export async function getParameterValue(name) {
  const res = await ssmClient.send(new GetParameterCommand({ Name: name }));
  return res.Parameter.Value;
}
