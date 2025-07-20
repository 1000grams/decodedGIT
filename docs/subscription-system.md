# Artist Access & Subscription System

This module governs dashboard access for artists and tracks recurring subscription revenue.

## Access Control
- Artists must exist in Cognito user pool `5fxmkd` to reach any `/api/dashboard/*` endpoint.
- Users are organised into groups like `admin`, `artist`, `buyer`, `catalog_curator`, `content_creator`, `music_supervisor`, and `review_only`.
- Only members of the `artist` group with an active subscription will see the dashboard.
- Each artist record stores `artist_id`, `email` and `active_subscriber` status.

## DynamoDB – `ArtistSubscriptions`
```json
{
  "artist_id": "RDV",
  "email": "artist@decodedmusic.com",
  "subscribed_since": "2025-06-01",
  "next_billing_date": "2025-07-01",
  "active": true,
  "subscription_id": "sub_abc123"
}
```

## Stripe Webhook Lambda
`subscriptionWebhookHandler` listens for Stripe events:
- `invoice.paid` → create/update the table entry and set `active` to **true**.
- `invoice.payment_failed` → mark the subscription **inactive** and send an email reminder via SES.

Webhook URL example: `/api/subscription/webhook`.

## Company Subscription Report Lambda
`subscriptionReportHandler` scans the table and returns company level metrics:
- `totalSubscribers` – count of active records.
- `monthlyRevenue` – `$99 * totalSubscribers`.
- `avgRetention` – average months since `subscribed_since` among all records.

This powers the internal **Decoded Music Paying Subscribers** dashboard.

## Future YouTube Integration
A placeholder table `CompanyYouTubeStats` stores channel stats for future AdSense hooks and community analysis.
