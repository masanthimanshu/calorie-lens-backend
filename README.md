# Calorie Lens Backend

A serverless Node.js backend for Calorie Lens that provides signed image upload URLs, processes food images from S3, invokes an AWS Bedrock model for inference, and stores results in DynamoDB.

## Table of Contents

- [What the project does](#what-the-project-does)
- [Why it is useful](#why-it-is-useful)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [Where to get help](#where-to-get-help)
- [Contributing](#contributing)

## What the project does

`calorie-lens-backend` is an AWS Serverless backend that:

- exposes an HTTP API for generating signed S3 upload URLs
- listens for image uploads into an S3 bucket
- retrieves and optimizes uploaded images
- sends image data to an AWS Bedrock model for inference
- saves processed results in a DynamoDB table
- processes DynamoDB stream events for downstream messaging/logging

## Why it is useful

This backend enables an image-first food logging workflow using AWS-managed services:

- fast upload flow with pre-signed S3 URLs
- automatic image processing and inference when new images arrive
- persistent storage of processed results for analytics or UI consumption
- local development support with `serverless-offline`

## Architecture

Key components:

- `src/storage/handler.js` — HTTP API entrypoint for upload URL generation and health checks
- `src/storage/routes.js` — Express routes mounted under `/storage`
- `src/processImage/handler.js` — S3 event handler for image processing
- `src/processImage/service.js` — image retrieval, optimization, and Bedrock model invocation
- `src/sendMessage/handler.js` — DynamoDB stream handler for downstream message processing
- `core/` — shared AWS helpers for S3, DynamoDB, Bedrock, parameter store, and runtime logging
- `aws/resources.yaml` — DynamoDB table and S3 bucket resource definitions
- `serverless.yaml` — Serverless Framework configuration for deployment

## Getting Started

### Requirements

- Node.js 20+ (runtime target is `nodejs24.x`)
- npm
- AWS credentials configured locally
- Access to AWS account with Bedrock, S3, DynamoDB, and IAM permissions

### Install dependencies

```sh
npm install
```

### Local development

Use Serverless Offline for local API development:

```sh
npm run dev
```

This starts the local HTTP API with `serverless-offline`.

## Configuration

The backend relies on environment variables defined in `serverless.yaml`:

- `CURRENT_AWS_REGION` — AWS region used by clients
- `TABLE_NAME` — DynamoDB table name
- `BUCKET_NAME` — S3 bucket name

A local `.env` file can also set AWS environment values such as:

```env
AWS_PROFILE=serverless-user
```

For Bedrock configuration, the code reads parameter store keys:

- `/ai/claude-model-arn`
- `/calorie-lens/lambda/system-prompt`

## Usage

### Health check

Request the health endpoint:

```sh
curl http://localhost:3000/storage/health
```

### Generate an upload URL

Request a signed URL for uploading a dish image:

```sh
curl -H "x-dish-name: Pasta" http://localhost:3000/storage/upload-url
```

Response:

```json
{
  "uploadUrl": "https://...",
  "key": "images/<uuid>.webp"
}
```

Upload the image data directly to the returned URL.

### Image processing flow

Once an image is uploaded to the configured S3 bucket under `images/`, the `processImage` function triggers:

- downloads the uploaded image
- optimizes it with `sharp`
- converts it to base64
- invokes the Bedrock model
- stores inference results in DynamoDB

## Deployment

Deploy the backend with Serverless Framework:

```sh
npm run deploy
```

The service name is configured as `calorie-lens-backend` in `serverless.yaml`.

## Where to get help

If you need assistance or want to report an issue, use the repository issue tracker.

## Contributing

Contributions are welcome via pull requests. For code changes, follow the repository workflow and open an issue first if you need design guidance.
