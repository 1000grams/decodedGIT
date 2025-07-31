# Marketing & Attribution Module

This document outlines the new marketing hub features added to the Decoded Music platform.

## DynamoDB Tables
- **MarketingSpend** – records ad spend entries per artist and campaign.
- **EstimatedEarnings** – projected earnings derived from stream counts.
- **ActualPayouts** – ingestion of royalty statements.
- **Reconciliation** – comparison of expected vs actual revenue.
- **WeeklyArtistStats** – metrics used for attribution calculations.
- **FanSegments** – stores fan emails tagged with engagement segments for targeted outreach.
  See [weekly-performance-tracking.md](weekly-performance-tracking.md) for the
  table schema and logging workflow.

## Lambda Functions
- `marketingSpendHandler` – CRUD interface for the `MarketingSpend` table.
- `attributionHandler` – correlates ad campaigns with streaming lifts and returns ROI data.
- `weeklyStatsLogger` – scheduled every Tuesday to store weekly performance metrics.
- `social` – posts a Carol Leifer-style caption about the top Google Trends topic with a rotating artist link.
- `marketingAutomation` – manages fan segmentation, sends email campaigns, and exposes deeper analytics.

These are exposed via API Gateway under `/api/marketing`.

## Automation Scripts
- `scripts/socialPostScheduler.js` queues posts to Instagram, Snapchat and YouTube.
- `scripts/trendingReposter.js` reposts content with trending hashtags from Twitter, TikTok and Reddit.
- `scripts/dailyContentAgent.js` generates captions with Bedrock, posts to Meta, and summarizes engagement.

## CloudFormation
The stack defined in `cloudformation/marketing-hub.yml` provisions the DynamoDB tables, Lambda functions and API routes required for the marketing dashboard.

## Dashboard Tabs
The frontend should include tabs for:
1. **Ad Spend Summary** – pulls from `/api/marketing`.
2. **ROI & Attribution** – queries `/api/marketing?campaign_id=xyz`.
3. **Post Scheduler** – schedules posts via the social posting script.
4. **Trending-Based Auto-Reposts** – managed by the trending repost script.
5. **Email Campaigns & Fan Segments** – target specific fan groups and track engagement.
6. **Advanced Analytics** – consolidated spend, stream, and subscriber metrics.

This provides artists with label-style marketing automation on AWS.
