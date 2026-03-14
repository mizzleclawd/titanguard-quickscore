# Abuse-control proof

Status: implementation evidence for PR review

## Boundary controls added
- signed bot proof required at submit boundary
- submit rate-limit table with rolling window + temporary block
- invalid/expired bot proof rejected server-side before assessment insert

## Server-side controls
- `issueBotProof` action returns signed proof tied to a client fingerprint
- `submit` mutation verifies bot proof and enforces rate limit before writing lead data
- `submitRateLimits` table records attempts and block windows

## Expected proof outcomes
### Rapid spam blocked
After more than 5 submit attempts in 10 minutes for the same `fingerprint:email` key:
- mutation throws `rate limit exceeded`
- no new assessment record is written
- `submitRateLimits.blockedUntil` is set

### Invalid bot token rejected
If bot proof is malformed, expired, or signed with the wrong secret:
- mutation throws `invalid bot proof` or `bot proof expired`
- no assessment record is written

## Test hook
- internal function: `testBoundaryCheck`
- internal action: `simulateRateLimitForTest`

These exist so the boundary logic can be exercised without exposing a public bypass path.
