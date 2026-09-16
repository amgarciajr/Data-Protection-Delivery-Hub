# Data connection readiness

The application now has an explicit Demo/Live environment boundary. Demo is the safe default. Live mode is selectable for walkthroughs of the future integration path, but the current build fails closed because no live adapter is implemented.

The prototype is intentionally disconnected from live services. It uses synthetic records with optional browser-local persistence so the UX and governance flows can be demonstrated safely.

For the complete Avanade rollout sequence, ownership model, environment strategy, Dataverse/SharePoint mapping, security, ALM, validation, and cutover checklist, see `docs/AVANADE_INTEGRATION_GUIDE.md`.

## Current state

- Repository mode: `local`
- Dataverse URL: intentionally blank
- SharePoint evidence site URL: intentionally blank
- SharePoint evidence library: intentionally blank
- Solution: `DataProtectionDeliveryHub`
- Publisher prefix: `dpdh`

## Connection boundary

The UI calls `src/data/repository.ts`, not Dataverse or SharePoint directly. This keeps the experience testable with synthetic data and establishes the replacement point for a Dataverse adapter.

When the target environment is approved:

1. Add the Dataverse environment URL and connection reference through target-environment configuration.
2. Map repository reads and writes to the `dpdh` Dataverse tables defined in `data-model/full-data-model.json`.
3. Store evidence files in the approved SharePoint library and persist only authoritative links and metadata in Dataverse.
4. Preserve the repository contract so filtering, exports, stage-gate evaluation, and approval UX remain unchanged.
5. Validate role boundaries, audit, retention, connector policy, and rollback before enabling live mode.

## Explicit non-goals

- No client data, credentials, secrets, tenant identifiers, or production endpoints are included.
- Browser-local persistence is demonstration storage only and is not authoritative.
- Synthetic records must be removed or isolated before shared or production deployment.
- `VITE_HUB_MODE=live` must not be enabled in a deployed environment until the adapter contract, authorization, audit, approvals, monitoring, and release evidence are complete.
