# Mini Accounting Module (v1)

This module tracks revenue and expenses for each artist and provides a simple dashboard export.

## Dashboard View Components

| Section | Fields |
| --- | --- |
| Revenue | Track title, type (single/album/sync), platform, est. revenue, payout status, payout date |
| Expenses | Vendor, type (marketing, ASCAP, distribution), amount, date, campaign |
| Summary Totals | Net earnings, total revenue, total expenses, unpaid revenue |

## DynamoDB Tables

### RevenueLog
```json
{
  "artist_id": "RDV",
  "track_id": "abc123",
  "title": "Fireproof",
  "type": "single",
  "platform": "Spotify",
  "revenue_cents": 4820,
  "period": "2025-02",
  "status": "Pending",
  "expected_payout_date": "2025-05-01"
}
```

### ExpenseLog
```json
{
  "artist_id": "RDV",
  "vendor": "Meta",
  "type": "marketing",
  "amount_cents": 599,
  "date": "2025-02-15",
  "campaign": "fireproof_ig_launch",
  "note": "Instagram ads for single release"
}
```

## Export Feature
A Lambda function (`GET /api/dashboard/accounting/export`) queries both tables, combines the records into a CSV and returns the file for download.

Sample CSV rows:
```
Type,Title/Vendor,Platform/Category,Amount (USD),Date,Status
Revenue,Fireproof,Spotify,$48.20,2025-02,Paid
Expense,Meta,Marketing,$5.99,2025-02,-
```

## Lagged Payout Logic
A scheduled Lambda runs monthly via EventBridge. Entries with a period three months old are automatically marked as `Paid` to simulate real royalty payouts.

## Frontend Stub
The React frontend now has an **Accounting** tab which lists placeholder charts and a CSV download button. In a production build it would call the API routes above and visualize monthly cash flow.
