# Storage and Database Overview

This document summarizes the DynamoDB tables and S3 buckets referenced in the repository. It helps confirm which resources are active in infrastructure templates and which may be leftovers from older deployments.

## DynamoDB Tables

| Environment Variable | Table Name | Source |
| --- | --- | --- |
| `CATALOG_TABLE` | `prod-Catalog` | `infra/template.yaml` |
| `DYNAMO_TABLE_EARNINGS` | `prod-DecodedEarnings` | `infra/template.yaml` |
| `DYNAMO_TABLE_STREAMS` | `prod-DecodedStreams` | `infra/template.yaml` |
| `DYNAMO_TABLE_CATALOG` | `prod-DecodedCatalog` | `infra/template.yaml` |
| `DYNAMO_TABLE_ANALYTICS` | `prod-WeeklyArtistStats` | `infra/template.yaml` |
| `DYNAMO_TABLE_STATEMENTS` | `prod-Statements` | `infra/template.yaml` |
| `SPEND_TABLE` | `prod-MarketingSpend` | `infra/template.yaml` |

The repository does **not** reference a table named `prod-ArtistStats`. Instead, lambdas and templates use the newer `prod-WeeklyArtistStats` name. Any remaining references to `prod-ArtistStats` can be removed.

## S3 Buckets

| Purpose | Bucket Name | Source |
| --- | --- | --- |
| Lambda deployment packages | `decodedmusic-lambda-code` | `infra/template.yaml` |
| Static frontend assets | `decoded-genai-stack-webappne-websitebucket4326d7c2-jvplfkkey9mb` | `docs/README.md` |
| Buzz summary text files | `decodedmusic-buzz-files` | `frontend/public/buzz.html` |
| Additional artist data buckets | `decodedmusic-artist-catalog`, `prod-decodedmusic-industrybuzz`, `prod-decodedmusic-previews`, `prod-decodedmusic-statements`, `prod-decodedmusic-uploads` | _not referenced in code_ |

Only `decodedmusic-lambda-code` is defined in the CloudFormation templates. The other buckets are currently managed outside of CloudFormation but are used in deployment scripts and manual workflows. Earlier docs referenced buckets named `decoded-assets` and `decodedmusic-data`, however those do not exist in the present environment.

## Next Steps

1. Decide whether the manually managed buckets should be defined in CloudFormation for consistency.
2. If so, add `AWS::S3::Bucket` resources and update the deployment scripts.
3. Remove any outdated references such as the former `prod-ArtistStats` table name.

