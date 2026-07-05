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

Notes

- There are currently no automated tests in the repository; prioritize clear, small commits and manual verification via `npm run dev` and relevant integration tests where possible.
- When in doubt, link to `serverless.yaml`, `package.json`, and `core/` in PR descriptions.
