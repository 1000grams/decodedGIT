# Weekly Artist Trend Tracker

This document describes the DynamoDB schema and scheduled Lambda used to store weekly marketing performance for each artist.

## DynamoDB Table – `WeeklyArtistStats`

| Field | Example | Description |
| --- | --- | --- |
| `artist_id` | `RDV` | Artist identifier |
| `week_start` | `2025-06-10` | ISO date of the Tuesday starting the week |
| `spotify_streams` | `15483` | Weekly Spotify stream count |
| `youtube_views` | `9122` | Weekly YouTube views |
| `snap_followers` | `198` | Snapchat follower count |
| `ig_followers` | `740` | Instagram follower count |
| `meta_spend_cents` | `799` | Facebook/Instagram ad spend |
| `google_spend_cents` | `349` | Google ads spend |
| `snapchat_spend_cents` | `289` | Snapchat ads spend |
| `engagement_rate` | `0.041` | Combined engagement percentage |
| `trend_notes` | `Strong Spotify lift after Snap ad spike` | Optional notes |

The table uses a composite primary key (`artist_id`, `week_start`) so weekly stats can be queried efficiently per artist.

## Scheduled Lambda

`weeklyStatsLogger` runs every Tuesday via EventBridge. The function pulls metrics from DSP and ad platforms (or simulates them during development) and writes one item per artist to the `WeeklyArtistStats` table. Environment variables define the target table and list of artist IDs.

CloudFormation resources:

```yaml
WeeklyStatsLogger:
  Type: AWS::Lambda::Function
  Properties:
    Runtime: nodejs18.x
    Handler: weeklyStatsLogger.handler
    Environment:
      Variables:
        STATS_TABLE: !Ref WeeklyArtistStatsTable
WeeklyStatsRule:
  Type: AWS::Events::Rule
  Properties:
    ScheduleExpression: 'cron(0 12 ? * TUE *)'
    Targets:
      - Arn: !GetAtt WeeklyStatsLogger.Arn
        Id: WeeklyStatsLoggerTarget
```

This job keeps a rolling history of ad spend and fan engagement so the dashboard can visualize performance trajectories over years.
