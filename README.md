# Calorie Lens Backend

[![Node.js](https://img.shields.io/badge/node.js-24.x-green?logo=node.js)](https://nodejs.org/)
[![Serverless Framework](https://img.shields.io/badge/serverless-4.38-orange?logo=serverless)](https://www.serverless.com/)
[![AWS](https://img.shields.io/badge/AWS-serverless-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://opensource.org/licenses/ISC)

A serverless Node.js backend for Calorie Lens that converts food images into structured nutrition insights. The service provides secure S3 upload URLs, automates image processing, invokes AWS Bedrock AI, and stores results in DynamoDB.

## Table of Contents

- [What It Does](#what-it-does)
- [Why It Matters](#why-it-matters)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Configure](#configure)
  - [Local Development](#local-development)
  - [Deploy](#deploy)
- [API Overview](#api-overview)
- [Architecture](#architecture)
- [Support](#support)
- [Contributing](#contributing)

---

## What It Does

Calorie Lens Backend is a serverless AWS application that:

- exposes HTTP endpoints for secure image upload URL generation and health checks
- processes uploaded food images from S3
- optimizes images and sends them to AWS Bedrock for AI inference
- stores analysis results in a DynamoDB table
- reacts to DynamoDB stream events for downstream workflows

## Why It Matters

This backend is useful for applications that need:

- direct browser-to-S3 image uploads via pre-signed URLs
- automatic serverless image processing after upload
- AI-powered meal analysis without managing model hosting
- scalable event-driven data persistence
- a local development experience with Serverless Offline

---

## Getting Started

### Prerequisites

- Node.js 24.x or later
- AWS account with credentials configured locally
- npm or yarn installed

### Install

Clone the repository and install dependencies:

```bash
git clone https://github.com/scoobies/calorie-lens-backend.git
cd calorie-lens-backend
npm install
```

### Configure

Create a `.env` file in the project root for local development:

```bash
CURRENT_AWS_REGION=ap-south-1
TABLE_NAME=calorie-lens-data-table
BUCKET_NAME=calorie-lens-assets-bucket
```

The service also relies on SSM parameters and AWS IAM permissions configured in `serverless.yaml` and `aws/`.

### Local Development

Run Serverless Offline:

```bash
npm run dev
```

This starts the storage API locally on `http://localhost:3000`.

Verify the service:

```bash
curl http://localhost:3000/storage/health
curl -H "x-dish-name: pancakes" http://localhost:3000/storage/upload-url
```

### Deploy

Deploy to AWS using Serverless Framework:

```bash
npm run deploy
```

This deploys the API, S3 event handler, DynamoDB stream handler, and resource definitions in `serverless.yaml`.

---

## API Overview

### `GET /storage/health`

Returns a simple health check response.

**Response:**

```json
{ "status": "Storage API route is working!" }
```

### `GET /storage/upload-url`

Generates a signed upload URL for the configured S3 bucket.

**Headers:**

- `x-dish-name` (optional): dish metadata stored with the object

**Response:**

```json
{
  "uploadUrl": "https://...",
  "key": "images/..."
}
```

**Example upload flow:**

```bash
URL=$(curl -s -H "x-dish-name: pizza" http://localhost:3000/storage/upload-url | jq -r '.uploadUrl')
curl -X PUT --data-binary @photo.webp "$URL"
```

After upload, S3 triggers the image processing Lambda.

---

## Architecture

### Main components

- `src/storage/` — Express-based storage API and upload URL generation
- `src/processImage/` — S3-triggered image processing and Bedrock inference
- `src/sendMessage/` — DynamoDB stream consumer for downstream event handling
- `core/` — shared AWS clients, logging, and utilities
- `aws/` — resource and IAM definitions
- `serverless.yaml` — service configuration for Serverless Framework

### Data flow

1. Client requests a pre-signed upload URL.
2. Client uploads an image directly to S3.
3. S3 emits an `ObjectCreated` event for a new image.
4. `processImage` Lambda downloads the image, optimizes it, and invokes Bedrock.
5. Processed results are written to DynamoDB.
6. DynamoDB stream events trigger `sendMessage` for downstream actions.

### AWS services used

- AWS Lambda
- Amazon API Gateway / HTTP API
- Amazon S3
- Amazon DynamoDB
- DynamoDB Streams
- AWS Bedrock Runtime
- AWS Systems Manager Parameter Store

---

## Support

For developer guidance, see `.github/AGENTS.md`.

If you need help with this repository, open an issue in the GitHub repository or use the repository issue tracker.

---

## Contributing

Contributions are welcome via pull requests. Keep changes focused, document behavior, and verify local behavior with `npm run dev`.

---

## Notes

- The repository uses ES modules and path aliases defined in `package.json`.
- There are currently no automated tests in this project.
- The project license is ISC.
