# Phase 1 validation plan

## Purpose

Validate that the first product-focus improvement makes the Hub easier to understand and act on before adding integrations or intelligence. Phase 1 is successful when a representative user can identify where to begin, locate the right work area, keep an engagement in context, and understand that the data remains synthetic/local.

This plan validates the published prototype at:

`https://amgarciajr.github.io/Data-Protection-Delivery-Hub/`

The phase does not authorize live data, production connectors, or claims of production readiness.

## Validation sequence

### 1. Build and deployment smoke test

**Objective:** confirm the published artifact is the expected build.

- Run `npm ci` and `npm run build` from `apps/data-protection-delivery-hub`.
- Confirm TypeScript compilation and Vite build succeed.
- Confirm the repository has no unintended working-tree changes.
- Confirm the Pages URL returns HTTP 200.
- Confirm relative JavaScript and CSS assets return HTTP 200.
- Confirm the Pages workflow succeeds for the commit under test.

**Evidence:** build output, commit SHA, workflow URL/status, hosted URL response, and asset response checks.

### 2. Navigation and discovery test

**Objective:** verify the five-zone model is understandable.

Test each zone:

| Zone | Expected first action |
| --- | --- |
| Start | Open Command Center or My Work |
| Deliver | Find the engagement, scope, execution, or decision workspace |
| Prove | Find controls, tests, evidence, or readiness |
| Transition | Find deliverables or operational handoff |
| Improve | Find reuse, practice intelligence, or administration |

Acceptance criteria:

- Each zone exposes only the workspaces available to the selected role.
- Selecting a zone changes the visible workspace list.
- Selecting a workspace opens the correct module.
- Existing detailed modules remain reachable.
- No navigation label implies that the prototype is connected to live delivery systems.

**Evidence:** dated screenshots or screen recording, test participant, role, task result, and observed friction.

### 3. Engagement context test

**Objective:** verify that active engagement context is visible and understandable.

- Select each synthetic engagement.
- Confirm its stage and health appear in the Command Center hero.
- Change the selection and confirm the header selection changes.
- Refresh the browser and confirm the expected prototype behavior is documented; do not infer server persistence.
- Confirm users can distinguish context selection from live Dataverse filtering.

**Known limitation:** Phase 1 displays context but does not yet filter every module record by engagement. Relationship-aware filtering is a subsequent foundation increment.

### 4. Search test

**Objective:** verify workspace discovery without bypassing role visibility.

- Search for a known module name.
- Search for a term from a module description.
- Select a result and confirm the correct zone and module open.
- Search as at least two roles and confirm results reflect the role-visible workspace list.
- Search with no matching result and confirm the application remains usable.
- Test keyboard focus, visible focus state, and mobile width.

**Evidence:** query, role, result, selected destination, and accessibility observation.

### 5. Role and safety-boundary test

**Objective:** confirm usability filtering is not presented as authorization.

- Change between Consultant, Engagement Manager, Practice Leader, Reviewer, and Platform Administrator.
- Confirm the visible workspace list changes as documented.
- Confirm the settings and user guide state that production authorization is enforced by Entra/Dataverse/server-side controls.
- Confirm no live connector or credential is present in the browser bundle.

**Evidence:** role matrix results, browser network inspection, and source/configuration review.

### 6. Responsive and accessibility smoke test

**Objective:** confirm the new shell remains usable.

- Test desktop, tablet-width, and mobile-width layouts.
- Verify engagement selector and search controls wrap without clipping.
- Navigate the zone and workspace controls by keyboard.
- Confirm visible focus indicators.
- Run a lightweight automated accessibility scan when available.
- Test reduced-motion preference.

**Evidence:** viewport list, findings, screenshots, and remediation status.

## Exit decision

Phase 1 may be accepted as a prototype increment when:

- build and hosted smoke tests pass;
- all five zones are reachable;
- representative role journeys complete without unexplained navigation failures;
- engagement context and search behave as documented;
- no live data or connector boundary is weakened;
- accessibility and responsive findings are recorded;
- the evidence pack is linked to the release commit.

Phase 1 must not be promoted to a production go-live decision. The next gate is a governed foundation validation covering Dataverse relationships, SharePoint evidence, server-side authorization, audit, approvals, and idempotent automation.

## Evidence pack template

Store or link:

1. release commit and build output;
2. hosted smoke-test result;
3. navigation test matrix;
4. role/search test results;
5. responsive/accessibility findings;
6. known limitations and accepted risks;
7. owner and date for each unresolved item.
