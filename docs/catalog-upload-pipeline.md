## Catalog Upload & Metadata Pipeline

This document outlines how uploaded music files are processed and indexed.

- **Upload Endpoint**: `POST /api/catalog/upload` returns a signed S3 `PUT` URL.
- **S3 Bucket**: `decodedmusic-uploads` stores ZIP files containing song metadata and stems.
- **SNS → SQS Pipeline**: New S3 objects publish to SNS, which triggers an SQS queue for decoupled processing.
- **Lambda #1 – Metadata Extractor**: Uses `music-metadata` (Node.js) or `pymediainfo` (Python) to parse each upload.
  - Extracts `bpm`, `key`, `genre`, `duration`, and ASCAP information.
  - Writes results to the `DecodedCatalog` DynamoDB table.
- **Lambda #2 – Mood/Genre Tagger**: Optional ML step that can call Bedrock or SageMaker to infer additional tags.
- **Change Data Capture → OpenSearch**: A Lambda subscribed to DynamoDB Streams updates the OpenSearch index so tracks can be searched and filtered.
