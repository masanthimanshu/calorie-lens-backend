# Agent Instructions for Calorie Lens Backend

## What this repository is

- A Node.js backend service written as an ES module project (`type: module`).
- Deployed with Serverless Framework to AWS.
- Uses AWS resources including S3, DynamoDB, Secrets Manager, SSM, and Bedrock runtime.
- Exposes a storage API via `src/storage/handler.js` and handles AWS events in `src/processImage/handler.js` and `src/sendMessage/handler.js`.

## Key directories

- `core/` — shared AWS clients, logging, and app creation helpers.
- `src/storage/` — Express-based HTTP API for storage-related routes and S3 upload URL generation.
- `src/processImage/` — S3-triggered image processing logic.
- `src/sendMessage/` — DynamoDB stream consumer logic.
- `utils/` — utility helpers such as image optimization and JSON cleaning.

## Important configuration

- `package.json` scripts:
  - `npm run dev` -> `serverless offline start --reloadHandler`
  - `npm run deploy` -> `serverless deploy`
- `serverless.yaml` defines the AWS service, provider, functions, and resources.
- AWS environment variables accessed at runtime:
  - `CURRENT_AWS_REGION`
  - `TABLE_NAME`
  - `BUCKET_NAME`

## Coding conventions and patterns

- Uses ES module `import` / `export` syntax.
- Custom path aliases are declared in `package.json` under `imports`:
  - `#core/*` -> `./core/*`
  - `#data/*` -> `./data/*`
  - `#utils/*` -> `./utils/*`
- Logging is centralized through `core/runtime_logs.js`.
- Serverless handler functions should remain thin; business logic belongs in `service.js` modules.

## What agents should do first

- Look at `serverless.yaml` for the deployed function entry points and event sources.
- Respect the existing AWS integration patterns in `core/` rather than inventing new clients.
- Keep changes limited to existing backend behavior unless asked to add new functionality.

## Common tasks for this codebase

- Fixing or extending AWS event handlers and S3/DynamoDB workflows.
- Updating `src/storage/routes.js` for HTTP route behavior.
- Making `core/` AWS helpers more resilient and consistent.
- Improving image processing logic in `src/processImage/service.js` and `utils/optimize_image.js`.

## Notes for agents

- There is no frontend code in this repository.
- There are no tests present yet; focus on implementation correctness and consistent style.
- If you need broader architecture context, use `serverless.yaml` and `package.json` as the source of truth.
