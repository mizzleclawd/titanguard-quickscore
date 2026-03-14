# TitanGuard QuickScore — retention and access policy

Status: final for PR gate review
Owner: Stringer (business owner) + Dee (system/data owner)
Review cadence: quarterly

## Systems in scope
- TitanGuard QuickScore frontend
- Convex assessment/event storage
- authenticated lead handoff destination
- dead-letter / retry logging records

## Retention
- assessment + lead records: 90 days unless promoted into an active sales opportunity/system of record
- retry/dead-letter operational logs: 30 days
- security review artifacts in repo: retained with source control history

## Access
- production lead data: Dee + designated revenue operator approved by Dee
- engineering access: Boris only for implementation/debug under Dee approval
- security review access: WhiteRose for audit/review

## Deletion workflow
- Dee is final approver for deletion/export requests
- Stringer owns business-side retention review and stale-lead purge requests
- Boris executes technical deletion/update in the approved system of record

## Incident ownership
- Dee owns incident response decisions for lead-data misuse or exposure
- WhiteRose owns security triage/review recommendations

## Policy notes
- no public/latest-lead query exposure
- no respondent payloads in analytics
- only required contact fields are captured in the intake flow
