# Copilot Instructions

This repository uses `AGENTS.md` to provide guidance for AI coding agents.

Please read `AGENTS.md` first for project architecture, deployment patterns, and code conventions.

Key points:
- Node.js ES module backend deployed with Serverless Framework.
- AWS event handlers are in `src/processImage/handler.js` and `src/sendMessage/handler.js`.
- HTTP storage API is in `src/storage/handler.js` and `src/storage/routes.js`.
- Shared AWS helpers and logging are in `core/`.
- Use `package.json` scripts and `serverless.yaml` as the source of truth.
