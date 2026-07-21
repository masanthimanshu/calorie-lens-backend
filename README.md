# Calorie Lens Backend

[![Node.js](https://img.shields.io/badge/node.js-24.x-green?logo=node.js)](https://nodejs.org/)
[![Serverless Framework](https://img.shields.io/badge/serverless-4.38-orange?logo=serverless)](https://www.serverless.com/)
[![AWS](https://img.shields.io/badge/AWS-serverless-orange?logo=amazon-aws)](https://aws.amazon.com/)

A serverless Node.js backend that transforms food images into structured nutrition insights. Calorie Lens Backend handles secure image uploads, automated processing with AWS Bedrock AI, and persistent storage—enabling a seamless, image-first food logging experience.

## Table of Contents

- [What It Does](#what-it-does)
- [Why Use It](#why-use-it)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Local Development](#local-development)
  - [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)

---

## What It Does

Calorie Lens Backend is a fully serverless AWS application that:

- **Provides HTTP endpoints** for generating secure S3 upload URLs and health checks
- **Automatically processes food images** when uploaded to S3 (resize, optimize)
- **Invokes AI inference** using AWS Bedrock to analyze meal photos
- **Persists results** in DynamoDB for analytics and UI consumption
- **Handles event streams** for downstream logging, notifications, or data pipelines

## Why Use It

This backend enables a modern, scalable food-logging experience:

- **Zero infrastructure management** — AWS Lambda scales automatically to millions of requests
- **Fast image uploads** — Pre-signed S3 URLs enable direct browser uploads without backend proxying
- **Intelligent analysis** — Bedrock integration provides AI-powered meal insights without managing models
- **Event-driven architecture** — DynamoDB streams trigger downstream workflows automatically
- **Local development** — Serverless Offline lets you test locally before deploying
- **Infrastructure-as-code** — All AWS resources defined in version-controlled YAML

---

## Getting Started

### Prerequisites

- **Node.js 24.x** or higher (ESM support required)
- **AWS Account** with credentials configured locally
- **npm** or **yarn** for dependency management

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/scoobies/calorie-lens-backend.git
   cd calorie-lens-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root (used by `serverless-offline` for local development):
   ```bash
   CURRENT_AWS_REGION=ap-south-1
   TABLE_NAME=calorie-lens-data-table
   BUCKET_NAME=calorie-lens-assets-bucket
   ```

### Local Development

Run the development server with hot-reloading enabled:

```bash
npm run dev
```

This starts Serverless Offline, which emulates AWS Lambda and API Gateway locally. The HTTP API will be available at `http://localhost:3000`.

**Test the storage API:**

```bash
curl http://localhost:3000/storage/health
# Response: { "status": "Storage API route is working!" }
```

**Get a signed upload URL:**

```bash
curl -H "x-dish-name: pancakes" http://localhost:3000/storage/upload-url
```

For a detailed walkthrough of the codebase and development patterns, see [AGENTS.md](.github/AGENTS.md).

### Deployment

Deploy to AWS with a single command:

```bash
npm run deploy
```

This uses the Serverless Framework to package and deploy all functions, HTTP routes, and AWS resources defined in [serverless.yaml](serverless.yaml).

**Deployment parameters:**

- **Stage:** `prod` (configurable in `serverless.yaml`)
- **Region:** `ap-south-1` (configurable in `serverless.yaml`)
- **Organization:** `scoobies` (update in `serverless.yaml` as needed)

---

## API Documentation

### `GET /storage/health`

Health check endpoint for monitoring.

**Response:**

```json
{ "status": "Storage API route is working!" }
```

### `GET /storage/upload-url`

Generates a pre-signed S3 URL for uploading an image.

**Headers:**

- `x-dish-name` (optional): Name of the dish being logged

**Response:**

```json
{
  "uploadUrl": "https://calorie-lens-assets-bucket.s3.amazonaws.com/...",
  "key": "images/..."
}
```

**Usage:**

```bash
# Get upload URL
URL=$(curl -s -H "x-dish-name: pizza" http://localhost:3000/storage/upload-url | jq -r '.uploadUrl')

# Upload image directly to S3
curl -X PUT --data-binary @photo.jpg "$URL"

# Backend automatically processes the image and runs inference
```

---

## Architecture

### System Components

| Component                                  | Purpose                                                        |
| ------------------------------------------ | -------------------------------------------------------------- |
| **Storage API** (`src/storage/`)           | HTTP endpoints for URL generation and health checks            |
| **Image Processing** (`src/processImage/`) | S3 event handler that retrieves, optimizes, and runs inference |
| **Message Handler** (`src/sendMessage/`)   | DynamoDB stream consumer for downstream workflows              |
| **Core Helpers** (`core/`)                 | Shared AWS clients, logging, and utilities                     |

### Data Flow

```
User Upload
    ↓
HTTP API → Pre-signed S3 URL
    ↓
Browser uploads to S3
    ↓
S3 triggers Lambda (processImage)
    ↓
Download image → Optimize → Bedrock inference
    ↓
Save result to DynamoDB
    ↓
DynamoDB stream triggers Lambda (sendMessage)
    ↓
Log or send notifications
```

### Key Files

- [serverless.yaml](serverless.yaml) — Function definitions and AWS resource mappings
- [package.json](package.json) — Dependencies and build scripts
- [core/](core/) — AWS clients for S3, DynamoDB, Bedrock, Secrets Manager, SSM
- [aws/](aws/) — Infrastructure-as-code (DynamoDB table, S3 bucket, IAM policies)
- [.github/AGENTS.md](.github/AGENTS.md) — Detailed technical reference for developers
