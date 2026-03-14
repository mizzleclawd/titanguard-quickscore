# TitanGuard QuickScore — draft retention and access policy

Status: draft pending owner confirmation

## Data collected
Required fields only:
- company name
- contact name
- contact email
- industry
- employee count
- assessment scoring outputs
- lifecycle and attribution metadata

## Data not intended for ad-platform sharing
- assessment answers
- score details
- recommendation payloads

## Proposed retention baseline
- lead/contact and assessment records: 90 days unless converted into an active sales opportunity
- delivery / audit logs: 30 days minimum for troubleshooting and abuse review
- dead-letter records: 30 days after resolution

## Proposed access model
- sales/revenue operations: access to contact identity and lifecycle stage only
- delivery/security reviewers: access to assessment details when needed for requested consultation
- no public or unauthenticated access
- all administrative access should be authenticated and logged

## Open owner decisions
- system of record for production leads
- deletion workflow owner
- final retention schedule owner
- incident response owner for lead-data misuse
