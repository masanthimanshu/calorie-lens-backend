# Calorie Lens Backend

[![Node.js](https://img.shields.io/badge/node.js-24.x-green?logo=node.js)](https://nodejs.org/)
[![Serverless Framework](https://img.shields.io/badge/serverless-4.40-orange?logo=serverless)](https://www.serverless.com/)
[![AWS](https://img.shields.io/badge/AWS-serverless-orange?logo=amazon-aws)](https://aws.amazon.com/)
[![License](https://img.shields.io/badge/license-ISC-blue)](https://opensource.org/licenses/ISC)

A serverless Node.js backend for Calorie Lens that converts meal images into structured nutrition data. It generates secure upload URLs, processes uploaded photos via AWS Lambda, invokes AWS Bedrock AI, and persists results in DynamoDB.

## Table of Contents

- [What It Does](#what-it-does)
- [Why It’s Useful](#why-its-useful)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Configure](#configure)
  - [Run Locally](#run-locally)
  - [Deploy](#deploy)
- [API Endpoints](#api-endpoints)
- [Architecture](#architecture)
- [Help](#help)
- [Contributing](#contributing)
- [Notes](#notes)

## What It Does

Calorie Lens Backend provides a serverless ingestion and processing pipeline for meal images:

- issues signed S3 PUT URLs for direct image upload
- receives S3 upload events and optimizes images with `sharp`
- sends image data to AWS Bedrock for AI inference
- stores inference results in DynamoDB
- processes DynamoDB stream records for downstream workflows

## Why It’s Useful

This project is ideal for developers building an image-first nutrition or meal logging service because it:

- avoids backend file proxying with direct S3 uploads
- automates image processing with event-driven AWS Lambda functions
- separates AI configuration from application code via SSM Parameter Store
- stores results in DynamoDB for scalable query and workflow automation
- supports local API development using `serverless-offline`

## Getting Started

### Prerequisites

- Node.js 24.x
- npm
- AWS credentials configured locally
- (Optional) Serverless Framework installed globally

### Install

```bash
git clone <repo-url>
cd calorie-lens-backend
npm install
```

### Configure

Create a `.env` file in the project root for local development:

```env
CURRENT_AWS_REGION=ap-south-1
TABLE_NAME=calorie-lens-data-table
BUCKET_NAME=calorie-lens-assets-bucket
```

The application also relies on AWS resources and parameters defined in `serverless.yaml`, `aws/iam.yaml`, and `aws/resources.yaml`.

### Run Locally

Start the local service:

```bash
npm run dev
```

Test the storage API:

```bash
curl http://localhost:3000/storage/health
curl -H "x-dish-name: pancakes" http://localhost:3000/storage/upload-url
```

### Deploy

Deploy the backend to AWS:

```bash
npm run deploy
```

This publishes the HTTP API, S3 event processor, DynamoDB stream consumer, and associated resources configured in `serverless.yaml`.

## API Endpoints

### `GET /storage/health`

Returns a health check response.

Example response:

```json
{ "status": "Storage API route is working!" }
```

### `GET /storage/upload-url`

Returns a pre-signed S3 upload URL for a new image.

Headers:

- `x-dish-name` (optional): stores dish metadata with the uploaded S3 object

Example response:

```json
{
  "uploadUrl": "https://...",
  "key": "images/<uuid>.webp"
}
```

Example upload flow:

```bash
URL=$(curl -s -H "x-dish-name: pizza" http://localhost:3000/storage/upload-url | jq -r '.uploadUrl')
curl -X PUT --data-binary @meal.webp "$URL"
```

After upload, S3 triggers the image processing Lambda.

## Architecture

### Core components

- `src/storage/` — Express route definitions and serverless HTTP handler
- `src/processImage/` — S3-triggered image processor that invokes AWS Bedrock
- `src/sendMessage/` — DynamoDB stream handler for downstream actions
- `core/` — shared AWS clients, logging, and configuration helpers
- `utils/` — image optimization and JSON cleanup helpers
- `aws/` — IAM and cloud resource definitions
- `serverless.yaml` — AWS resources and function wiring

### Data flow

1. Client requests a signed upload URL
2. Client uploads the image directly to S3
3. S3 emits an `ObjectCreated` event
4. `processImage` Lambda downloads and optimizes the image
5. Lambda sends the image to Bedrock for inference
6. Inference output is stored in DynamoDB
7. DynamoDB stream triggers `sendMessage` for downstream processing

### AWS services used

- AWS Lambda
- Amazon S3
- Amazon DynamoDB
- DynamoDB Streams
- AWS Bedrock Runtime
- AWS Systems Manager Parameter Store
- AWS IAM

## Help

Refer to `.github/AGENTS.md` for repository-specific guidance.

For repo issues or questions, open an issue in the repository issue tracker.

## Contributing

Contributions are welcome via pull requests. Keep changes small, document behavior clearly, and verify local behavior with `npm run dev`.

## Notes

- This repository uses ES modules (`type: "module"`).
- Model settings are loaded from AWS SSM Parameter Store.
- The current project does not include automated tests.
