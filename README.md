# Data Protection Delivery Hub

Synthetic/local prototype and Avanade integration planning package for improving Data Protection delivery quality and consistency.

## Open the app

**Live app:** [Open the Data Protection Delivery Hub](https://amgarciajr.github.io/Data-Protection-Delivery-Hub/)

If the link has not deployed yet, open the repository **Actions** tab and wait for **Deploy Data Protection Delivery Hub** to complete. The GitHub repository page opens this README by design; the link above opens the application.

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
- [Leadership brief — contribution since June 6](docs/LEADERSHIP_BRIEF_73_DAYS.md)
- [Product operating model review](docs/PRODUCT_OPERATING_MODEL_REVIEW.md)
- [Phase 1 validation plan](docs/PHASE_1_VALIDATION_PLAN.md)
- [User guide](docs/USER_GUIDE.md)
- [Support runbook](docs/SUPPORT_RUNBOOK.md)