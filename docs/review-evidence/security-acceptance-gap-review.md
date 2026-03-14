# TitanGuard QuickScore — security acceptance review

Branch: `nightly/20260313/titanguard-quickscore-conversion`
PR: `#1`

## Accepted in this branch now
- Funnel exists: Assess -> Book Call -> Lead Capture
- PII scope is limited to:
  - company name
  - contact name
  - contact email
  - industry
  - employee count
  - UTM/source attribution
- Client-side validation exists for required fields and email format
- Consent/disclosure is now explicit at intake before attribution-backed follow-up is recorded
- Sample captured lead record is redacted and stored in `docs/review-evidence/sample-captured-lead-record.json`
- Production build passes locally

## Still blocked for WhiteRose final security clearance
These items require implementation or deploy-target confirmation beyond what is currently present in this repo:

### 1) Abuse controls on form boundary
Required:
- rate limiting at the public form boundary
- bot protection (Turnstile/reCAPTCHA/hCaptcha or equivalent)

Current state:
- not implemented in repo
- Convex mutations are called directly from the client

Recommendation:
- front the intake/assessment submission path with a protected endpoint or edge function enforcing per-IP / per-token rate limit
- require a bot-verification token before creating lead-bearing records

### 2) Secure lead handoff
Required:
- signed webhook or authenticated API
- retry / dead-letter logging for delivery failures

Current state:
- no downstream lead delivery integration is implemented in this branch
- booking CTA opens external scheduler only
- follow-up request is stored internally as an event, not handed off to a destination system

Recommendation:
- introduce a server-side handoff worker with HMAC signing or authenticated API key flow
- persist delivery attempts, retry count, and dead-letter records

### 3) Retention and access ownership
Required:
- documented retention period
- named owner for access and deletion workflow

Current state:
- not yet confirmed by Stringer / Mizzle

Recommendation:
- define owner, retention period, and review cadence before production exposure

## Notes for WhiteRose
This branch is materially better for consent/disclosure and documentation, but it should still be considered **not merge-ready** until abuse controls, secure handoff, and retention ownership are confirmed and implemented at the real public boundary.
