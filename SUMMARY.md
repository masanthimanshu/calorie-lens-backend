## Executive Overview

Calorie Lens Backend is a serverless Node.js application that converts meal photos into structured nutrition insights by orchestrating secure S3 uploads, image optimization, managed AI inference, and event-driven persistence. It solves the problem of ingesting and analyzing food images without proxying files through the backend, enabling a scalable image-first food logging workflow.

The primary goal is to enable an automated, event-driven meal image analysis pipeline that minimizes infrastructure operations while maximizing scalability, security, and operational observability.

## Technical Stack Mapping

- Languages: Node.js 24.x (ESM)
  - Why: Native AWS Lambda support for modern ECMAScript modules and asynchronous runtime features, enabling lightweight serverless functions.
- Frameworks / Runtime: Serverless Framework, Express, serverless-http
  - Why: Serverless Framework provides declarative infrastructure-as-code for AWS resources and Lambda wiring, while Express with serverless-http offers an easy local HTTP API abstraction without introducing heavyweight server frameworks.
- Cloud Services: AWS Lambda, Amazon S3, Amazon DynamoDB, DynamoDB Streams, AWS Bedrock Runtime, AWS Systems Manager Parameter Store, AWS Secrets Manager, AWS IAM
  - Why: Lambda removes server management for compute, S3 stores image assets securely, DynamoDB offers serverless NoSQL persistence with streams for async processing, Bedrock supplies managed AI inference, and SSM/Secrets Manager externalize runtime configuration and secrets.
- Databases: AWS DynamoDB
  - Why: Pay-per-request, serverless NoSQL storage fits the event-driven processing model and removes the need for relational database provisioning.
- Image Processing: sharp
  - Why: High-performance image resizing and WebP conversion reduces payload size and standardizes inference inputs.
- AWS SDK v3: Modular clients for Bedrock, DynamoDB, S3, SSM, Secrets Manager
  - Why: Modular SDK improves cold-start performance and keeps Lambda bundles smaller by importing only the necessary service clients.
- Utility Libraries: dotenv, axios, zod
  - Why: dotenv manages local environment variables for development, axios is available for HTTP client work, and zod supports future schema validation needs.
- Dev Tooling: ESLint, serverless-offline
  - Why: ESLint enforces JavaScript quality rules, while serverless-offline supports local testing of Lambda handlers and HTTP endpoints before deployment.

## Engineering Achievements (The Gold Mine)

### Secure Direct Uploads

- Challenge: Avoid backend file proxying while still receiving image uploads and metadata.
- Action: Implemented pre-signed S3 PUT URL generation in `core/s3_client.js`, exposing `GET /storage/upload-url` and attaching dish metadata via object metadata headers.
- Result: Direct browser-to-S3 upload flow reduced backend bandwidth, simplified scaling, and preserved dish context for downstream processing.

### Event-Driven Image Processing Pipeline

- Challenge: Trigger image processing automatically when new images are uploaded.
- Action: Configured an S3 event source for `s3:ObjectCreated:*` in `serverless.yaml` to invoke `src/processImage/handler.js` on upload completion.
- Result: Image ingestion became fully asynchronous and scalable, eliminating polling and enabling Lambda-based compute only when data arrives.

### Managed AI Inference with AWS Bedrock

- Challenge: Perform food image understanding using a managed AI model while keeping runtime configuration dynamic.
- Action: Built `core/bedrock_client.js` to retrieve model ARN and system prompt from AWS SSM, prepare Bedrock inference payloads, and decode JSON responses.
- Result: Achieved centralized AI configuration and rapid model switching without code changes, while outsourcing inference complexity to Bedrock.

### Image Optimization and Input Normalization

- Challenge: Ensure uploaded images are optimized and consistent before sending to AI inference.
- Action: Used `sharp` in `utils/optimize_image.js` to resize images to 512px width and encode them as WebP with quality tuning.
- Result: Reduced data size, improved ingestion reliability, and standardized the image format passed to model inference.

### Resilient Persistence with DynamoDB

- Challenge: Persist AI results reliably and support downstream consumers.
- Action: Implemented `writeData()` in `core/dynamo_client.js` using `DynamoDBDocumentClient`, UUID primary keys, ISO timestamps, and conditional writes.
- Result: Created an idempotent persistence layer that supports auditability and triggers DynamoDB stream consumers for further processing.

### Downstream Stream-Driven Notification Workflow

- Challenge: Process new inference records asynchronously after they are written to storage.
- Action: Added a `sendMessage` Lambda triggered by DynamoDB Streams in `serverless.yaml`, parsing stream INSERT events in `src/sendMessage/handler.js`.
- Result: Enabled a decoupled downstream workflow that can be extended into notifications, analytics, or messaging without blocking the main ingestion path.

### Shared AWS Client Abstractions and Cleanup Logic

- Challenge: Reduce duplication and keep function handlers thin.
- Action: Centralized AWS service clients, runtime logging, parameter retrieval, and S3 operations in `core/`, while extracting JSON cleanup logic into `utils/clean_json.js`.
- Result: Simplified handler code, improved maintainability, and encouraged reuse across serverless functions.

### Structured Logging for Observability

- Challenge: Provide actionable logs in serverless executions.
- Action: Built lightweight JSON log wrappers in `core/runtime_logs.js` for structured `info` and `error` output.
- Result: Logs are CloudWatch-compatible and include contextual metadata for faster incident analysis.

## Architectural Highlights

### Data Flow

1. Client requests a signed upload URL from `GET /storage/upload-url`.
2. Backend returns a pre-signed S3 PUT URL and object key.
3. Client uploads the image directly to S3 under `images/<uuid>.webp`.
4. S3 emits an `ObjectCreated:*` event, invoking `processImage` Lambda.
5. Lambda downloads the image from S3, optimizes it, Base64-encodes it, and sends it to Bedrock.
6. Bedrock returns inference text output, which is cleaned and written to DynamoDB.
7. DynamoDB Stream fires `sendMessage` Lambda on INSERT events for downstream processing.

### Security Implementations

- IAM role grants least-privilege access to S3 objects, DynamoDB table operations, Bedrock invocation, and SSM/Secrets Manager retrieval.
- Pre-signed S3 URLs expire after 5 minutes, limiting upload window and attack surface.
- Model ARN and prompts are stored in AWS SSM Parameter Store, avoiding hardcoded configuration and supporting secret management.
- S3 lifecycle policies automatically expire image objects after 100 days and transition older objects to Glacier IR, improving data governance.

### Scalability Approach

- Serverless Lambda functions scale automatically per incoming S3 events and DynamoDB stream records.
- DynamoDB Pay-Per-Request billing supports unpredictable workloads without capacity provisioning.
- Direct upload architecture offloads file transfer traffic from Lambda and API infrastructure.
- Event-driven decoupling separates ingestion, inference, storage, and messaging so each layer can scale independently.

## Potential KPI Suggestions

- End-to-end image processing latency from upload completion to DynamoDB write.
- Percentage of uploaded images successfully processed and persisted.
- Time to deploy backend changes using Serverless Framework.
- Reduction in backend bandwidth from direct S3 uploads.
- Cost per image processed in the serverless pipeline.
- Number of AI inference requests handled per hour/day.
- Lambda error rate and mean time to recover from processing failures.
