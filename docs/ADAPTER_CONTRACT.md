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
