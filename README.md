# Data Protection Delivery Hub

Synthetic/local prototype and Avanade integration planning package for improving Data Protection delivery quality and consistency.

## Contents

- `apps/data-protection-delivery-hub/` — React/Vite source application
- `docs/` — integration guide, leadership brief, production evaluation, user guide, support runbook, readiness, and handoff documentation
- `data-model/` — target Dataverse-oriented data model
- `tests/` — acceptance criteria
- `power.config.json` — solution identity and connector placeholders

## Run locally

```powershell
Set-Location apps/data-protection-delivery-hub
npm install
npm run dev
```

The app intentionally uses synthetic data and browser-local persistence. It is not a production deployment. Dataverse, SharePoint, Entra security, audit, retention, ALM, monitoring, and support controls must be configured and tested before live use.

## Key documentation

- [Avanade integration guide](docs/AVANADE_INTEGRATION_GUIDE.md)
- [Production evaluation](docs/PRODUCTION_EVALUATION.md)
- [First-73-days leadership brief](docs/LEADERSHIP_BRIEF_73_DAYS.md)
- [User guide](docs/USER_GUIDE.md)
- [Support runbook](docs/SUPPORT_RUNBOOK.md)