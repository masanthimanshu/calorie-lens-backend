## Executive Overview

Calorie Lens Backend is a serverless Node.js application that converts food images into structured nutrition insights by orchestrating secure uploads, image optimization, AI inference, and persistent storage. It enables a seamless image-first food logging pipeline where users upload meal photos, the backend processes them automatically, and the results are stored for downstream consumption.

The primary goal is to enable an automated, event-driven meal image analysis workflow that minimizes infrastructure operations while maximizing scalability and security.

## Technical Stack Mapping

- Languages: Node.js 24.x (ESM)
  - Why: Modern AWS Lambda runtime support for native ECMAScript modules and current JavaScript language features.
- Frameworks / Runtime: Serverless Framework, Express, serverless-http
  - Why: Serverless Framework provides declarative AWS infrastructure-as-code and deployment orchestration, while Express with serverless-http delivers a lightweight HTTP API abstraction inside Lambda.
- Cloud Services: AWS Lambda, AWS S3, AWS DynamoDB, AWS Bedrock, AWS SSM, AWS Secrets Manager, AWS IAM
  - Why: Lambda enables pay-per-use compute for event-driven processing, S3 stores image assets securely, DynamoDB offers serverless NoSQL persistence and change streams, Bedrock provides managed AI inference, and SSM/Secrets Manager handle configuration and secrets without hardcoding values.
- Databases: AWS DynamoDB
  - Why: NoSQL document storage with pay-per-request billing and DynamoDB Streams enables scalable event-driven downstream processing without operational database management.
- Image Processing: sharp
  - Why: High-performance server-side image optimization and format conversion reduces payload size and improves inference reliability.
- AWS SDK v3: Modular clients for Bedrock, DynamoDB, S3, SSM, Secrets Manager
  - Why: Modular SDK reduces package weight and gives fine-grained access to AWS services.
- Utility Libraries: dotenv, axios, zod
  - Why: dotenv supports local environment configuration, axios is available for HTTP integration, and zod provides a validation-ready dependency if schema validation is required.
- Dev Tooling: ESLint, serverless-offline
  - Why: ESLint maintains code quality and serverless-offline enables local Lambda/API Gateway emulation for development.

## Engineering Achievements (The Gold Mine)

### Secure Direct Uploads

- Challenge: Prevent the backend from becoming a file proxy while still accepting image uploads.
- Action: Implemented pre-signed S3 upload URLs using `@aws-sdk/s3-request-presigner` and metadata propagation for dish names.
- Result: Achieved direct browser-to-S3 uploads with temporary credentials, reduced backend bandwidth, and preserved context for downstream processing.

### Event-Driven Image Processing Pipeline

- Challenge: Automatically process newly uploaded images in a scalable, reliable way.
- Action: Configured S3 `ObjectCreated:*` event triggers in `serverless.yaml` to invoke a Lambda function that downloads the image, optimizes it, and invokes AI inference.
- Result: Converted uploads into a hands-off event-driven pipeline that scales with demand and prevents manual polling.

### AI Inference Integration with AWS Bedrock

- Challenge: Analyze food images using a managed generative AI service without embedding model details.
- Action: Built `invokeModelForImage()` in `core/bedrock_client.js` to fetch model configuration from SSM, construct Bedrock inference payloads, and decode model responses.
- Result: Separated configuration from code, enabling dynamic model ARN and prompt management while leveraging Bedrock for AI-driven meal analysis.

### Image Optimization Before Inference

- Challenge: Ensure image data is efficient for upload and model ingestion.
- Action: Used `sharp` in `src/processImage/service.js` to resize/optimize images, then encoded results as Base64 for Bedrock payloads.
- Result: Reduced data transfer size and improved consistency of AI input format.

### Persistent Event Data Storage

- Challenge: Store inference outputs reliably and enable downstream workflows.
- Action: Implemented `writeData()` in `core/dynamo_client.js` with UUID primary keys, timestamp metadata, and conditional writes to DynamoDB.
- Result: Achieved idempotent persistence with traceable records and support for DynamoDB Streams-driven automation.

### Infrastructure-as-Code with Lifecycle Policies

- Challenge: Deploy complete AWS resources with reproducible configuration.
- Action: Defined Lambda functions, S3 bucket lifecycle rules, DynamoDB stream configuration, and IAM permissions in `serverless.yaml` and `aws/resources.yaml`.
- Result: Created a deployable, version-controlled cloud architecture that enforces retention and storage transitions.

### Shared AWS Client Abstractions

- Challenge: Avoid duplication across functions and enforce consistent AWS access patterns.
- Action: Created shared helper modules in `core/` for S3 presigned URLs, object retrieval, DynamoDB writes, Bedrock calls, and SSM parameter access.
- Result: Centralized AWS integrations, simplified handler logic, and improved maintainability.

### Logging and Observability

- Challenge: Provide meaningful runtime telemetry in a serverless environment.
- Action: Built structured JSON logging utilities in `core/runtime_logs.js` for both `info` and `error` events.
- Result: Enabled CloudWatch-compatible logging that supports debugging and operational monitoring.

## Architectural Highlights

### Data Flow

1. Client requests `/storage/upload-url`.
2. Storage API generates a pre-signed S3 PUT URL and returns it to the client.
3. Client uploads the image directly to S3 under `images/` prefix.
4. S3 triggers `processImage` Lambda on object creation.
5. Lambda downloads the object, optimizes the image, and invokes AWS Bedrock with base64-encoded image content.
6. Inference results are cleaned and written to DynamoDB.
7. DynamoDB Stream triggers the `sendMessage` Lambda for downstream notification or logging workflows.

### Security Implementations

- IAM role grants least-privilege access to S3, DynamoDB, Bedrock, SSM, and Secrets Manager.
- S3 pre-signed URLs limit upload scope and expire after 5 minutes.
- Model ARN and system prompt are retrieved at runtime from AWS SSM Parameter Store, avoiding hardcoded secrets.
- The S3 bucket lifecycle rules enforce storage hygiene and reduce exposure by automatically expiring objects after 100 days.

### Scalability Approach

- Serverless Lambda functions scale automatically with concurrent S3 events and stream records.
- DynamoDB Pay-Per-Request billing removes provisioning concerns and supports burst traffic.
- Direct browser-to-S3 uploads offload file transfer load from compute.
- The event-driven architecture decouples upload ingestion, image processing, AI inference, and downstream message handling.

## Potential KPI Suggestions

- End-to-end image processing latency from upload completion to DynamoDB write.
- Percentage of uploaded images successfully processed and persisted.
- Deployment frequency or time to deploy a backend change via Serverless Framework.
- Reduction in backend proxy bandwidth thanks to presigned S3 uploads.
- AWS cost per processed image or monthly cost for the serverless pipeline.
- Number of inference requests handled per hour/day under load.
- Error rate or mean time to recover for Lambda image processing failures.
