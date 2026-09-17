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

### 7. Guided onboarding and tooltip test

**Objective:** help a new user understand the product without adding friction for an experienced user.

- Clear local demo preferences or use a fresh browser profile.
- Confirm the welcome walkthrough appears once when Guided mode is enabled.
- Confirm **Start exploring** closes the walkthrough and that it does not reappear after refresh.
- Open settings, turn Guided mode off, and confirm onboarding cues are removed.
- Turn Guided mode back on and confirm the preference persists locally.
- Hover and keyboard-focus each visible **i** marker and confirm the explanation is readable.
- Confirm tooltip text does not obscure the action being explained and remains usable on mobile width.
- Confirm reduced-motion preferences do not introduce distracting animation.

**Evidence:** first-use screenshot, guided-mode preference result, tooltip keyboard result, and any usability findings.

### 8. Evidence chain test

**Objective:** confirm the requirement → evidence → review → linked task/decision → readiness/gate chain is visible, accurate, and actionable, and that missing/unaccepted evidence is obvious and links to the right workspace.

Repeatable steps:

1. Open **Command Center** and confirm the **Evidence chain** panel is visible, and open **Testing & Evidence** and confirm the same panel renders there.
2. Confirm the panel's "X of Y need attention" count matches the number of chains whose overall status pill is not Green.
3. Switch the view control to **Needs attention** and confirm only chains with at least one non-Green node remain, including any chain built from a risk or decision that has no linked My Work task (a "gap" chain, shown fully Red/Amber).
4. For a chain built from a My Work task, click each of its five nodes in turn (required input, evidence item, review status, linked task/decision, readiness/gate impact) and confirm each opens a detail panel describing that node and, when the node is not Green, a next action.
5. From a non-Green **evidence item** or **review status** node, select the next action and confirm it opens **My Work**.
6. From a **readiness/gate impact** node, select the next action and confirm it opens **Readiness & Assurance**.
7. From a gap chain's **linked task/decision** node, select **Create/update My Work task** and confirm it creates/updates a task and opens **My Work** with that task visible (the same signal-to-task pattern used by the Command Center risk/decision rows).
8. Confirm every chain is computed from local demo data only (My Work tasks, RAID risks/decisions, stage gates) in both Demo and Live mode — no network request is made when the panel renders or a node is selected.
9. Repeat steps 4–7 after creating or editing a My Work task in **My Work** and confirm the corresponding chain node updates to reflect the new evidence status/owner without a page reload.

**Evidence:** dated screenshots of the panel in both locations, the needs-attention count before/after filtering, confirmation that each next action opens the correct module, and confirmation of no network call (browser network inspection) during chain rendering and node selection.

### 9. Stage report builder test

**Objective:** confirm the former stage documentation generator now produces only the content sections selected by the user, while preserving local-only generation, copy, and download behavior.

Repeatable steps:

1. Open **Command Center** and locate the **Stage report builder** card.
2. Confirm all section checkboxes are selected by default.
3. Generate a report for a templated stage and confirm the output includes the checked core sections.
4. Clear at least two core sections (for example **Purpose** and **Known gaps**) and generate again; confirm those headings and their body text are absent from the output, while still-selected sections remain.
5. Enable one optional section (for example **Evidence chain summary**) and confirm new content appears in the generated output, not just a visual checkbox state.
6. Use **Copy to clipboard**, **Download .md**, and **Download .txt** after filtering and confirm each artifact contains the same filtered content shown onscreen.
7. Repeat the test in Demo mode and verify no network request is made during generation, copy, or download. In Live mode, confirm the existing fail-closed boundary remains intact.

**Evidence:** before/after generated output samples, screenshot or recording of checkbox changes, copied/downloaded artifact checks, and confirmation that the Demo/Live boundary is unchanged.

## Exit decision

Phase 1 may be accepted as a prototype increment when:

- build and hosted smoke tests pass;
- all five zones are reachable;
- representative role journeys complete without unexplained navigation failures;
- engagement context and search behave as documented;
- no live data or connector boundary is weakened;
- accessibility and responsive findings are recorded;
- Guided mode and tooltip behavior are understandable and keyboard accessible;
- the evidence chain panel accurately reflects My Work/RAID/gate state and every non-Green node offers a working next action;
- the stage report builder includes only the selected sections, and copy/download preserve that filtered content;
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
8. Demo/Live indicator and Live-mode fail-closed evidence;
9. evidence that Live never silently falls back to synthetic data.
10. successful completion of the four-step leadership walkthrough from Command Center through My Work and Prove.
11. evidence chain test result (panel visibility, needs-attention accuracy, node next actions, and no-network confirmation).
12. stage report builder test result (checkbox defaults, filtered content proof, copy/download parity, and boundary confirmation).
