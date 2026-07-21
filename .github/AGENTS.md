%23 Agent Instructions for Calorie Lens Backend

Purpose: provide concise, actionable guidance for AI coding agents working on this repository.

Quick Start

- **Dev (local):** `npm run dev` — runs Serverless Offline with handler reload.
- **Deploy:** `npm run deploy` — runs `serverless deploy`.
- **Reference files:** [package.json](package.json), [serverless.yaml](serverless.yaml).

What this repository is

- Node.js ES module backend (`type: module`) using Serverless Framework.
- AWS-backed: S3, DynamoDB, Secrets Manager, SSM, and Bedrock runtime.
- HTTP storage API and AWS event handlers live under `src/` (see links below).

Key files and places to inspect first

- Handlers and services:
  - [src/processImage/handler.js](src/processImage/handler.js) + [src/processImage/service.js](src/processImage/service.js)
  - [src/sendMessage/handler.js](src/sendMessage/handler.js) + [src/sendMessage/service.js](src/sendMessage/service.js)
  - [src/storage/handler.js](src/storage/handler.js) + [src/storage/routes.js](src/storage/routes.js)
- Shared helpers: [core/](core/) — `runtime_logs.js`, AWS clients, `create_app.js`.
- Infrastructure: [serverless.yaml](serverless.yaml), [aws/](aws/) (IAM & resources).
- Project config: [package.json](package.json).

Project conventions (short)

- Use ES module `import`/`export` syntax and path aliases declared in `package.json` (`#core/*`, `#data/*`, `#utils/*`).
- Keep Serverless handlers minimal; place business logic in `service.js` alongside each handler.
- Use `core/` helpers for AWS clients and centralized logging.

Agent checklist (what to do first)

1. Read [serverless.yaml](serverless.yaml) to identify functions and event sources.
2. Open the relevant handler and its `service.js` (listed above).
3. Prefer existing `core/` helpers for AWS integrations; avoid adding new AWS client patterns.
4. Run `npm run dev` for local reproduction when changing HTTP routes or handler logic.
5. Keep changes scoped and add a short explanation in PRs about AWS resource impacts.

Common tasks and useful pointers

- Update HTTP routes: `src/storage/routes.js` (Express app used by `src/storage/handler.js`).
- Image processing: `src/processImage/service.js` and `utils/optimize_image.js`.
- DynamoDB consumers: `src/sendMessage/service.js`.

Code patterns and conventions

**Error handling and logging**

All handlers and services follow a consistent error handling pattern: wrap in try-catch, log with `logger.error()`, then re-throw. Logs are formatted as JSON for CloudWatch parsing.

```javascript
import { logger } from "#core/runtime_logs.js";

export const handler = async (event) => {
  try {
    // business logic
  } catch (error) {
    logger.error("Descriptive error message:", { error });
    throw error;
  }
};
```

The logger outputs structured JSON with `level`, `message`, `time`, and optional data fields. Always include context (e.g., resource keys or IDs) in the data object for debugging.

**AWS SDK v3 command pattern**

All AWS clients use the command pattern: initialize the client once at module load, then call `client.send(new Command(...))` for each operation.

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const dbClient = new DynamoDBClient({ region: process.env.CURRENT_AWS_REGION });
const docClient = DynamoDBDocumentClient.from(dbClient);

export async function writeData(data) {
  const params = { TableName: process.env.TABLE_NAME, Item: data };
  await docClient.send(new PutCommand(params));
}
```

Clients are initialized at module scope for performance. Use the helper functions in [core/](core/) rather than creating new client instances.

**Parameter store configuration**

Dynamic configuration is loaded from AWS Systems Manager Parameter Store at runtime. See [core/parameter_store.js](core/parameter_store.js) for the helper.

```javascript
import { getParameterValue } from "#core/parameter_store.js";

async function getModelConfig() {
  const [modelArn, systemPrompt] = await Promise.all([
    getParameterValue("/ai/claude-model-arn"),
    getParameterValue("/calorie-lens/lambda/system-prompt"),
  ]);
  return { modelArn, systemPrompt };
}
```

Use `Promise.all()` to batch parameter lookups for efficiency.

**HTTP request conventions**

Express routes use custom headers for optional parameters. For example, the upload endpoint reads the dish name from the `x-dish-name` header:

```javascript
routes.get("/upload-url", async (req, res) => {
  res.send(await generateImageUploadUrl(req.headers["x-dish-name"]));
});
```

Always document custom header expectations in API comments or PR descriptions.

Notes

- There are currently no automated tests in the repository; prioritize clear, small commits and manual verification via `npm run dev` and relevant integration tests where possible.
- When in doubt, link to `serverless.yaml`, `package.json`, and `core/` in PR descriptions.
