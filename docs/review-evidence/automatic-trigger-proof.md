# Automatic trigger proof

## Deterministic execution path
- Convex cron file added: `convex/crons.ts`
- Schedule: every 1 minute
- Invokes: `internal.assessments.processPendingLeadHandoffs`

## Effect
No manual invocation is required once deployed with Convex cron enabled.
Due rows are processed automatically when:
- `status = pending` or `status = retry_pending`
- `nextAttemptAt <= now`

## Deploy note
This repo now contains the scheduler definition in source control. Deploying the Convex project is the step that activates the cron in the target environment.
