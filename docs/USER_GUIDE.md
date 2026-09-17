# Data Protection Delivery Hub user guide

## Purpose

Use the Hub to make delivery work, ownership, evidence, readiness, decisions, and reusable practice knowledge visible in one place. The Hub supports better delivery quality and consistency; it does not replace professional judgment or authorized approvals.

## Start here

The Hub is organized into five experience zones:

| Zone | Use it for |
| --- | --- |
| **Start** | Command Center, My Work, alerts, and the next action |
| **Deliver** | Intake, engagements, discovery, scope, execution, RAID, and decisions |
| **Prove** | Architecture, controls, testing, evidence, and readiness |
| **Transition** | Deliverables, operational handoff, acceptance, and support readiness |
| **Improve** | Reusable knowledge, practice intelligence, improvement actions, and administration |

1. Select the relevant zone, then choose a workspace module visible for your role.
2. Use the **Engagement** selector to keep the active engagement in context.
3. Use **Search modules and actions** to find an available workspace without browsing every module.
4. Open **Command Center** to understand portfolio health, quality signals, risks, readiness, and practice-improvement actions.
5. Open **My Work** to work from assigned lifecycle tasks.
6. Select a task stage and status to focus the queue.
7. For each task, confirm the expected outcome, required evidence, owner, due date, blocker, and definition of done.
8. Use the relevant module to update the authoritative delivery record.
9. Use **Administration** for configuration, connection readiness, stage templates, reuse governance, role mapping, and audit information.

## Guided mode and helpful explanations

On first use, Guided mode opens a short welcome walkthrough covering **Start**, **Deliver**, and **Prove**. Close it with **Start exploring**; the choice is remembered in this browser. Reopen settings to turn Guided mode on or off.

When Guided mode is enabled, hover or focus on the small **i** markers beside unfamiliar concepts to see plain-language explanations. Tooltips are also keyboard-focusable. They explain the delivery model without changing the underlying records or decision rights.

## Command Center

Use Command Center for leadership and delivery reviews:

- **Supervisor briefing:** start with the visible briefing panel to explain what the Hub is, how a signal becomes owned work, and the boundary between this demonstration and production implementation.
- **Quality metrics:** compare baseline, target, actual, cohort, period, and trend.
- **Practice improvement:** review recurring problems, owners, targets, status, and impact.
- **Leadership alignment:** frame the review around practice impact, evidence/control, scale/reuse, and attention required.
- **Engagement portfolio:** review stage, health, and progress.
- **Priority risks:** identify items needing action or escalation.
- **Stage gate watchlist:** identify gates that are blocked or conditional.
- **Stage documentation generator:** turn the stage template, My Work tasks, stage gates, and the selected engagement into readable stage documentation.

Metrics in the current demonstration are synthetic. Treat them as a presentation model until production metric lineage is configured.

For a supervisor presentation, do not describe the screen as a collection of dashboard cards. Explain the operating loop: **see the signal → trace the source → move the work → protect the gate**. Use the briefing panel's walkthrough and execution-view buttons, then click a risk or decision to show that the dashboard leads to an actionable workspace rather than ending at a visual summary.

## My Work

My Work is the execution view. Each task should be clear enough that another qualified person can understand what completion means.

Review these fields before changing status:

- **Stage:** the lifecycle point: Discover, Design, Validate, Transition, or another configured stage.
- **Expected outcome:** the result the task must produce.
- **Evidence required:** the record, link, or review outcome that proves completion.
- **Owner and due date:** the accountable person/team and committed date.
- **Definition of done:** the conditions that must be true before completion.
- **Blocker / escalation:** the current obstacle or “No blocker”.

Use status consistently:

| Status | Use when |
| --- | --- |
| Not started | Work has not begun |
| In progress | Work is actively being completed |
| Blocked | Work cannot proceed without a dependency, decision, or escalation |
| Ready for review | The output exists and is awaiting the authorized reviewer |
| Complete | The definition of done and review requirements are satisfied |

Do not mark work complete merely because a file exists. The evidence must be authoritative and reviewed where required.

## Lifecycle expectations

Use the stage template for the current engagement. Confirm required inputs, expected outputs, decision rights, and exit criteria before progressing. A stage gate cannot be treated as Green when a mandatory criterion is unresolved.

### Generating stage documentation

In **Command Center**, the **Stage documentation generator** card lets you pick one of the four templated stages (Discover, Design, Validate, Transition) for the currently selected engagement and produce readable, ready-to-share documentation covering:

- Purpose, required inputs, expected outputs, decision rights, and exit criteria (from the stage template)
- Known gaps derived from current demo data (missing/blocked tasks, unaccepted evidence, stage gate status, and — for the engagement's current stage — low readiness/evidence coverage or non-Green health)
- Evidence to gather, owners and due dates, and suggested next actions

Use **Generate documentation** to assemble the output from local data only, **Copy to clipboard** to paste it elsewhere, and **Download .md** / **Download .txt** to save a file. Everything is computed locally from the demo template, stage gates, My Work tasks, and the selected engagement — no live connector or network call is made, even when Live mode is selected, so the Demo/Live boundary is preserved.

### Evidence chain

The **Evidence chain** panel — visible on **Command Center** and on the **Testing & Evidence** module — makes the link between a required input, its evidence, the review outcome, the linked task or decision, and the resulting readiness/gate impact explicit and clickable.

Each row is a chain of five nodes:

1. **Required input** — the requirement/stage input the work is tied to.
2. **Evidence item** — the evidence described on the linked My Work task.
3. **Review status** — whether that evidence has been reviewed and accepted.
4. **Linked task/decision** — the My Work task, or the RAID risk/decision record, backing the chain.
5. **Readiness/gate impact** — the stage gate this chain feeds into (or “no gate tracked” when the stage has none configured).

Each node is color-coded (Green/Amber/Red) and clickable:

- Selecting a node opens its detail, including why it is Green/Amber/Red and what "done" looks like.
- When a node is not Green, the detail includes a **next action** button — usually **Open My Work** (to fix the evidence, review, or task) or **Open Readiness & Assurance** (to review the gate). Chains that start from an unmitigated risk or an undecided decision with no linked task instead offer **Create/update My Work task**, which creates or updates the task and takes you straight to My Work — the same pattern used elsewhere in the Hub for turning a signal into owned work.
- Use the **Needs attention** filter to show only chains with a Red/Amber node — this is the fastest way to see which required inputs still lack accepted evidence, and where a risk or decision has no evidence trail at all (a "gap" chain, shown fully Red/Amber).

Chains are computed locally from the current demo's My Work tasks, RAID risks/decisions, and stage gate status — no live connector or network call is made in either Demo or Live mode, so the Demo/Live boundary is preserved.

## Evidence and deliverables

Evidence remains **Submitted** until an authorized reviewer accepts it. Deliverables follow the configured review path and must not skip mandatory review states. Record the authoritative SharePoint link and metadata; do not duplicate sensitive content unnecessarily.

## Risks, decisions, and exceptions

Record the issue in the appropriate register. Include owner, due date, impact, mitigation, escalation, and decision rationale. Risk acceptance and exceptions require an authorized approver; exceptions also require a compensating control and expiry where applicable.

## Knowledge and reuse

Never publish client-confidential material as a practice asset. Confirm sanitization, assign a reviewer, capture the review outcome, and publish only after approval. Track version and adoption.

## Settings and roles

The demonstration settings pane supports language, theme, Guided mode, and role-based navigation. Zone and workspace visibility are usability aids, not security controls. In production, Entra identity, Dataverse roles, teams, field security, and server-side checks determine access.

## Phase 1 demonstration boundary

The engagement selector, search, role preferences, and locally created records are demonstration features backed by synthetic data and browser-local persistence. They do not connect or synchronize with Dataverse, SharePoint, Teams, Planner, Outlook, OneNote, Power BI, or Copilot.

## Demo and Live mode

The header shows the active environment mode. **Demo mode** is the safe working mode and uses synthetic/local data. **Live mode** is a guarded implementation path: in this prototype it stops at a clear handoff screen because no approved live adapter is connected. Do not interpret the toggle as authentication, authorization, or proof of production readiness.

## Leadership walkthrough

For a first-time user or leadership presentation, select **Settings → Demo experience → Leadership walkthrough**, or select **Start leadership walkthrough** on Command Center. The walkthrough explains the story in four steps:

1. Command Center: understand the portfolio and readiness conversation.
2. Lifecycle: select an orange `i` beside a stage to open a readable stage explanation.
3. My Work: connect signals to owners, evidence, definitions of done, and escalation.
4. Prove and improve: review evidence, transition readiness, and reusable practice improvements.

Use **Next** to move through the story, **Exit walkthrough** to return to the normal dashboard, and the orange lifecycle `i` button to inspect any stage at any time. The dashboard is intentionally seeded with synthetic records so the leadership experience can be demonstrated without client data.

## What to do when something is wrong

Do not work around a control by copying data to an unapproved location or changing a record outside the Hub. Capture the engagement, record, action, time, error text, and business impact, then follow `SUPPORT_RUNBOOK.md`.
