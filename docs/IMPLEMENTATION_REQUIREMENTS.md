# Implementation requirements and expectations

This document is the handoff contract for replacing the prototype repository with a governed implementation. The team must preserve the experience and controls; it must not simply connect the current browser storage to client data.

## Required outcomes

- Keep the five-zone experience: Start, Deliver, Prove, Transition, and Improve.
- Keep lifecycle stages, stage gates, engagement context, evidence traceability, readiness, handoffs, metrics, guided mode, and role-aware navigation.
- Replace synthetic/local persistence with Dataverse as the authoritative system of record.
- Store evidence in an approved SharePoint library and retain links, metadata, classification, review state, and retention references in Dataverse.
- Preserve explicit loading, empty, validation, authorization, connector, partial-success, and retry states.
- Keep Demo and Live visibly distinct. Live must fail closed; it must never silently show Demo data.

## Technical expectations

- Implement the interfaces in `src/data/repository.ts` behind a typed adapter boundary.
- Use Entra ID identity and server-side/Dataverse authorization. UI role filtering is usability only.
- Use environment variables and Power Platform connection references; do not place secrets, tokens, tenant IDs, or user identities in the bundle.
- Use stable IDs, engagement/workstream relationships, active/inactive state, optimistic concurrency, and idempotency keys.
- Make writes auditable, retryable, and observable. Return actionable errors rather than success-shaped fallbacks.
- Add health checks for Dataverse, SharePoint, flows, notification dependencies, and audit persistence.
- Provide automated unit, integration, accessibility, responsive, authorization, failure-recovery, and end-to-end acceptance coverage.

## Live-mode release gate

`VITE_HUB_MODE=live` is permitted only when the adapter is implemented and the release evidence is approved by product, technical, data, security, and support owners. Configuration values alone are insufficient. The current prototype intentionally keeps the live-data guard disabled.

Before enabling Live, provide:

1. Dataverse and SharePoint adapter implementation and contract tests.
2. Entra/Dataverse role, team, field-security, and restricted-engagement tests.
3. Audit, retention, backup, restore, rollback, monitoring, alerting, and incident evidence.
4. Power Platform solution packaging, managed deployment, environment variables, connection references, and rollback procedure.
5. Pilot results showing delivery consistency, evidence completeness, handoff quality, adoption, and supportability.
6. A named owner for every unresolved risk and a go/conditional-go decision record.

## Expected developer handoff

The implementation team should be able to identify the adapter seam, environment contract, target tables, SharePoint library, authorization model, error behavior, test evidence, and release decision without reverse-engineering the prototype. Any deviation from this contract must be recorded as an architecture decision and approved by the technical and product owners.
