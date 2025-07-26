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
| Static frontend assets | _none referenced_ | — |
| Uploaded ZIPs and generated buzz files | _none referenced_ | — |

Only the `decodedmusic-lambda-code` bucket appears in CloudFormation or scripts. Buckets named `decoded-assets` and `decodedmusic-data` are mentioned in early design notes but are not present in the current code base. Create them via CloudFormation if still required, or clean up any outdated references.

## Next Steps

1. Confirm whether `decoded-assets` and `decodedmusic-data` are still used in other environments or manual workflows.
2. If they are active, add corresponding `AWS::S3::Bucket` resources to the CloudFormation templates for traceability.
3. Remove any remaining references to the old `prod-ArtistStats` table name.

