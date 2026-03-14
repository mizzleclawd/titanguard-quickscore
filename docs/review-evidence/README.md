# Review Evidence — nightly/20260313/titanguard-quickscore-conversion

## Scope
- CTA flow: Assess → Book call → Contact capture
- UTM source/medium/campaign tracking
- Thank-you event logging
- Persona copy tightened for HIPAA / SOC 2 / NAIC audiences

## Local validation
- Production build completed successfully with `VITE_CONVEX_URL=https://demo.convex.cloud npm run build`
- Desktop screenshot captured locally:
  - `/mnt/storage/openclaw-state/media/browser/f3023da1-2f81-49e6-93bf-b66de3e4a413.jpg`
- Mobile screenshot captured locally:
  - `/mnt/storage/openclaw-state/media/browser/7fb06a6c-9899-4425-9034-18e117979702.jpg`

## Sample captured lead record
See `sample-captured-lead-record.json` for the expected assessment + event snapshot, including:
- UTM attribution fields
- lifecycle stage
- thank-you/book-call event trail

## Security acceptance notes
- `security-acceptance-gap-review.md` documents what is satisfied in-branch versus what still requires production-boundary implementation.
- `retention-access-policy-draft.md` captures the draft retention/access policy pending owner confirmation.
