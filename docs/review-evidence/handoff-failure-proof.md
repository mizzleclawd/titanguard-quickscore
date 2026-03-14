# Lead handoff failure proof

Status: implementation evidence for PR review

## Secure handoff controls added
- lead handoff records queued in `leadHandoffs`
- downstream delivery uses authenticated webhook headers
- signature header: `x-titanguard-signature`
- event header: `x-titanguard-event: lead_assessment`

## Retry / dead-letter behavior
- max attempts: 3
- retry delays:
  - 60 seconds
  - 5 minutes
  - 15 minutes
- final failed state: `dead_letter`

## Observability
### On success
- `leadHandoffs.status = delivered`
- `handoffAttempts` receives a `delivered` record

### On downstream failure or missing env config
- `leadHandoffs.status = retry_pending` until max attempts reached
- `handoffAttempts` receives failure records with response code + preview
- after max attempts, `leadHandoffs.status = dead_letter`
- `deadLetterReason` is recorded on the handoff row

## Required env vars
- `TITANGUARD_BOT_PROOF_SECRET`
- `TITANGUARD_LEAD_WEBHOOK_URL`
- `TITANGUARD_LEAD_WEBHOOK_SECRET`

## Notes
This PR adds the queueing, authentication, retry, and dead-letter data model + processing path. Deployment must configure the env vars above for live delivery.
