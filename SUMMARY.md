# Calorie Lens Backend

A serverless AWS backend that powers an image-first food logging experience by turning uploaded meal photos into structured nutrition insights. The platform combines secure storage, event-driven processing, and AI inference to streamline data capture and accelerate downstream workflows.

## Core Strengths

- Built with Node.js, Express, Serverless Framework, and AWS services including S3, DynamoDB, Bedrock, IAM, and Secrets Manager.
- Designed with a modular, event-driven architecture that supports signed upload flows, automated image processing, and backend state management.
- Emphasizes scalability, security, and infrastructure-as-code with reusable cloud resources and environment-driven configuration.

## Key Contributions

- Exposes an HTTP API for generating signed upload URLs and managing storage-related requests.
- Triggers automated image optimization and AI-based analysis when new images arrive in S3.
- Stores processed results in DynamoDB and supports downstream messaging and logging workflows.

## Impact

- Enables fast, reliable food-image ingestion with minimal operational overhead.
- Reduces manual effort in turning visual food data into structured, usable backend state for applications and analytics.
