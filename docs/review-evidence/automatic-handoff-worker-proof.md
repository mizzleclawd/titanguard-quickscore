# Automatic handoff worker proof

## Worker path added
- `processPendingLeadHandoffs` internal action scans due rows where:
  - `status = pending` OR `status = retry_pending`
  - `nextAttemptAt <= now`
- each due row is sent to `processLeadHandoff`

## State transitions
- `pending -> delivered` on successful authenticated webhook delivery
- `pending -> retry_pending` on first/second failure
- `retry_pending -> delivered` on later success
- `retry_pending -> dead_letter` after max attempts

## Internal API alignment
- `getHandoffForProcessing` now exported as `internalQuery`
- `listDueHandoffs` exported as `internalQuery`
- worker action calls internal endpoints consistently via `internal.assessments.*`

## Operational note
This PR adds the worker processing path inside Convex. Production scheduling still needs the deployment-side trigger (cron/job runner) to invoke `processPendingLeadHandoffs` on an interval.
