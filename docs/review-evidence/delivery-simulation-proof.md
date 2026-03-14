# Delivery simulation proof

## Success path
Expected transition:
- `leadHandoffs.status: pending -> delivered`
- `handoffAttempts` receives `delivered`

## Failure path
Expected transition on downstream error:
- first failure: `pending -> retry_pending`
- later failure(s): remains `retry_pending` with incremented `attempts`
- final failure after max attempts: `retry_pending -> dead_letter`
- `deadLetterReason` populated

## Retry timing
- attempt 1 retry: +60s
- attempt 2 retry: +5m
- attempt 3 retry: +15m then dead-letter on failure

## Observable records
- `leadHandoffs`
- `handoffAttempts`

## Notes
This branch implements the state machine and cron-triggered worker path. Live end-to-end proof requires deployed Convex environment variables and target webhook availability.
