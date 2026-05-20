import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretsClient = new SecretsManagerClient({
  region: process.env.CURRENT_AWS_REGION,
});

export async function getSecretValue(name) {
  const res = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: name }),
  );

  return res.SecretString;
}
