# Production adapter contract

The UI depends on the repository boundary in `src/data/repository.ts`. Live services must implement the same behaviors without changing the experience:

- Read and write engagement-linked records with server-side authorization.
- Persist task, stage-gate, evidence, deliverable, risk, decision, improvement, and reusable-asset relationships in Dataverse.
- Store evidence files in the approved SharePoint library and retain only authoritative links and metadata in Dataverse.
- Return explicit loading, partial, validation, authorization, and connector errors.
- Record meaningful changes in the audit history.
- Use idempotency keys for provisioning, notifications, retries, and flow-created records.

## Demo/live runtime contract

The application exposes an environment mode so the same experience can be used for safe demonstration and later governed implementation:

| Mode | Behavior |
|---|---|
| `demo` | Uses synthetic seed data and browser-local persistence. This is the current working mode. |
| `live` | Must fail closed until an approved live adapter is implemented, configured, tested, and enabled by the release pipeline. |

Configure the mode with `VITE_HUB_MODE` using `.env.example` as a starting point. The in-app toggle is a developer/demo control; it is not authorization and must not be used to bypass environment governance.

The current code intentionally keeps `canUseLiveData` false. A development team must replace that guard only after implementing the adapter and completing the production handoff controls. Enabling a URL or setting `VITE_LIVE_ADAPTER_CONFIGURED=true` alone must never expose synthetic data as live data.

Environment-specific values belong in Power Platform environment variables and connection references. No endpoint, identity, secret, or tenant value belongs in the client bundle.

## Implemented today (client-side, no server) vs. requires production infrastructure

To keep the demo honest about what is real, this table separates capabilities that run for real in the browser today from ones that are documented adapter contracts only:

| Capability | Status today | What "live" requires |
|---|---|---|
| Notification center (overdue / due-soon / predictive / decision signals) | **Implemented.** Computed client-side from local work tasks, risks, and decisions in `getNotifications()`. | A real alerting/notification service (email, Teams, push) would need a scheduled server-side job — not client polling — plus per-user subscription and delivery preferences. |
| PowerPoint export (leadership deck) | **Implemented.** Builds a real, editable `.pptx` in-browser with `pptxgenjs` from the same local data and triggers a download. | Optional enhancement: a server-side template/branding service or SharePoint auto-publish step; not required for the deck to be real and usable today. |
| Stage-gate e-signature approval | **Implemented as a demo capture.** Records typed name, decision, rationale, and timestamp to the local audit trail (`recordGateApproval`). | A production-grade signature needs identity-verified attribution (Entra ID sign-in) and, if required by policy, a certified e-signature provider — not just a typed name in a browser. |
| Comments & @mentions | **Implemented.** Stored and rendered locally per record (`getComments`/`addComment`); `@name` is text-highlighted only. | Real mention notifications (e.g., "you were mentioned") require a backend to resolve directory identities and deliver a notification — this prototype does not look up or notify real people. |
| Predictive signals | **Implemented as a simple heuristic**, not machine learning: flags blocked tasks and approaching/overdue dates. | A production predictive model would need historical delivery data, a trained model or rules engine, and a data pipeline — out of scope for a static client demo. |
| Audit trail | **Implemented.** Key actions (status changes, comments, approvals, report generation, improvements) write to a local audit log (`writeAuditEvent`). | Production audit needs a tamper-evident, centrally stored log (e.g., Dataverse audit or a SIEM), not `localStorage`. |
| Bulk filters & search (My Work, modules) | **Implemented.** Client-side filtering by stage, status, owner, free text, and an overdue toggle. | No production gap — this is a UI feature and works the same way against a live data source. |
| Accessibility (dialogs) | **Implemented.** Shared `useDialogA11y` hook provides focus-on-open, a Tab focus trap, Escape-to-close, and focus restoration across all modals. | No production gap — carries over unchanged to a live backend. |
| Entra ID authentication | **Not built.** The role switcher is a local, unauthenticated demo control. | Real Entra ID app registration, sign-in, and role/claims mapping. |
| Dataverse persistence | **Not built.** All records live in browser `localStorage`. | The Dataverse solution, tables, and security roles described elsewhere in this contract. |
| Live Microsoft Graph connectors (Outlook/Teams gather) | **Not built.** See the Outlook/Teams section below. | Server-side/Power Automate component with delegated Graph permissions; cannot run from the browser. |
| Server-side scheduled email/Teams delivery | **Not built.** Sharing today is `mailto:`/clipboard only. | A scheduled server-side job (Power Automate/Graph) to send email or post to Teams on a cadence, independent of a user having the app open. |

## Outlook/Teams adapter (future scope, not built in this prototype)

The prototype's report generators (Stage Report Builder and the Project status report) run entirely client-side against synthetic/local data and only offer no-auth sharing conveniences (a `mailto:` link and a clipboard copy formatted for a Teams post). They do **not** call Microsoft Graph and cannot gather or post data to a real mailbox, calendar, or Teams channel — that requires server-side authentication this static, secret-free build cannot hold.

A governed implementation may add a real Outlook/Teams adapter for two distinct capabilities. Keep them separate in design and permissions:

1. **Gather** — read signal source data (e.g., meeting notes, flagged emails, channel messages linked to an engagement) to enrich records or evidence.
   - Requires Entra app registration with delegated Graph permissions (`Mail.Read`, `Calendars.Read`, `ChannelMessage.Read.All` or narrower, as approved by security).
   - Must run through a server-side/Power Automate component — never call Graph directly from the browser with a user token embedded in the SPA.
   - Data pulled in must be treated like any other evidence: linked record, authoritative reference, sensitivity classification, and reviewer disposition — never auto-accepted as evidence.
2. **Share** — post the generated report (or a link to it) to a Teams channel/chat or send it via Outlook.
   - Minimum viable, low-risk version: keep the current `mailto:`/clipboard approach, or extend it with the Teams **deep link** share URL (`https://teams.microsoft.com/share?...`), which needs no Graph permissions and no token.
   - Fuller version (posting via the Graph `chatMessage`/`channel` API, or attaching the report file to SharePoint and sending a Teams card) requires the same delegated-permission and server-side pattern as above, plus rate-limit and retry handling per the write-auditability requirements already stated in this contract.

Do not build either capability directly against the client bundle in `apps/data-protection-delivery-hub`. Treat it as a new adapter behind the `src/data/repository.ts` boundary, gated by its own environment variable and Live-mode readiness check, consistent with the Dataverse/SharePoint adapter above.
