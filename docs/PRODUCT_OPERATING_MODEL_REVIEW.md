# Product operating model review

## Executive verdict

The Hub is a credible governance prototype, not yet an operating system for a global consulting organization. Its strongest contribution is the connection between lifecycle work, evidence, readiness, and practice improvement. Its biggest weakness is that it still asks users to navigate a catalogue of modules and manually maintain records that should be created or enriched from the tools consultants already use.

The adoption thesis should be:

> **The Hub is the control plane for consulting delivery. It does not replace Teams, SharePoint, Planner, Outlook, OneNote, Copilot, or Power BI. It connects their signals to governed ownership, evidence, decisions, readiness, and reusable outcomes.**

That positioning is materially stronger than presenting another portal, dashboard, or form system.

## Current maturity assessment

| Capability | Current state | Target state |
| --- | --- | --- |
| System of record | Local synthetic repository and illustrative records | Dataverse authority for structured delivery records and relationships |
| Reporting dashboard | Strong prototype signals and leadership framing | Permission-filtered portfolio and practice metrics with lineage |
| Delivery operating system | Lifecycle tasks and stage templates are visible | Embedded in engagement cadence, approvals, evidence, and handoffs |
| System of intelligence | Explainable advisory signals are demonstrated | Proactive prediction, recommendations, anomaly detection, and learning loops |
| Workflow integration | Manual demonstration forms | Event-driven ingestion from Microsoft 365 and delivery tools |
| Practice improvement | Backlog, metric history, and reuse governance are represented | Closed-loop measurement of failure, intervention, adoption, and outcome |

## Challenge 1 — Explain the value immediately

### First-30-seconds promise

The homepage should answer:

> **What should I do next, what could fail, what proof is missing, and what decision is needed?**

The redesigned Command Center now leads with four role-specific value propositions:

- **Consultant:** move delivery forward faster with less status reporting.
- **Engagement Manager:** know whether the engagement is safe to advance.
- **Practice Manager/Leader:** scale what works and identify recurring failure.
- **Director:** see portfolio health, delivery quality, resource leverage, and decisions requiring attention.

### Why use this instead of the existing tools?

| Existing tool | Keep using it for | Hub adds |
| --- | --- | --- |
| Teams | Conversation and collaboration | Links decisions, actions, risks, and evidence to the engagement record |
| SharePoint | Files and document collaboration | Evidence metadata, review state, sensitivity, retention, and authoritative references |
| Planner | Personal/team task execution | Lifecycle stage, definition of done, evidence, approval, and traceability |
| Outlook | Meetings, commitments, and reminders | Harvests decisions/actions and connects them to delivery impact |
| OneNote | Workshop notes and working knowledge | Converts reviewed outputs into findings, requirements, and evidence candidates |
| Copilot | Drafting and summarization | Produces source-linked advisory insights with validation labels |
| Power BI | Analytical reporting | Receives governed metrics with security-aware lineage and action links |
| PowerPoint | Executive storytelling | Generates a defensible narrative from current records instead of manual status assembly |

The Hub must not force users to duplicate content that already exists. If an integration cannot remove a duplicate update, it must provide a clear benefit or remain optional.

## Challenge 2 — Make work flow obvious

### End-to-end journey map

| Journey moment | User question | Hub responsibility | Exit evidence |
| --- | --- | --- | --- |
| Qualify | Should we take this work? | Offering fit, objectives, constraints, delivery risk, expected outcomes | Accepted handoff |
| Initiate | Who is accountable and how will we work? | Charter, team, workstreams, stakeholder/RACI, cadence | Approved charter |
| Discover | What is true today? | Workshops, requests, observations, questions, evidence | Reviewed findings |
| Assess | What matters most? | Maturity, findings, recommendations, prioritization | Validated assessment |
| Design | What will we build or change? | Options, decisions, controls, exceptions, rollback | Approved design |
| Build | Is delivery controlled? | Configuration, actions, dependencies, defects, changes | Validated configuration |
| Validate | Is it proven? | Tests, evidence review, defects, traceability, readiness | Accepted evidence |
| Transition | Can operations own it? | Runbooks, training, operators, support, handoff | Accepted handoff |
| Close | Did we deliver the commitment? | Acceptance, outcomes, open backlog, lessons | Closed engagement |
| Operate | Did it create value? | Benefits, adoption, incidents, lessons, reuse | Outcome review |

### Navigation implementation status

Phase 1 implements the five-zone first experience. The detailed modules remain available within each zone and continue to be filtered by the selected demonstration role:

1. **Start** — Command Center, My Work, universal search, alerts.
2. **Deliver** — Engagements, lifecycle, workstreams, milestones, RAID, decisions.
3. **Prove** — Scope, requirements, controls, tests, evidence, readiness.
4. **Transition** — Deliverables, handoff, operations, acceptance, benefits.
5. **Improve** — Practice intelligence, reusable assets, improvement actions, administration.

Keep the detailed modules available through contextual tabs and search, but do not make new users understand the data model before they can act.

The current implementation also provides:

- persistent synthetic engagement context in the header;
- cross-module search over available workspace modules and descriptions;
- automatic navigation to the correct zone when a search result is selected;
- responsive context controls for smaller screens.

This improves orientation but does not yet create relationship-aware records or live engagement filtering. Those remain production-foundation work.

### Stage-gate model

Every gate should evaluate five dimensions:

- **Scope:** commitment and change boundaries are approved.
- **Delivery:** tasks, dependencies, defects, and ownership are controlled.
- **Proof:** required evidence is authoritative and reviewed.
- **Decision:** accountable approvers have recorded rationale.
- **Operations:** support, training, ownership, and acceptance are ready.

Mandatory failures block progression. Weighted scores explain confidence; they never override a failed mandatory criterion.

### Readiness model

Readiness should be a decision tree, not only a score:

`Not assessed → Evidence requested → Under review → Conditionally ready → Ready for decision → Go / Go with conditions / No-go`

Show the failed criteria, owner, due date, evidence link, and next action beside every recommendation.

## Challenge 3 — Reduce administrative burden

### Manual-entry inventory and target treatment

| Current/manual item | Automate? | Harvest source | AI opportunity |
| --- | --- | --- | --- |
| Engagement charter | Yes | CRM/opportunity, approved offering, Teams team | Draft objectives, assumptions, and risks for review |
| Workstreams and standard tasks | Yes | Offering/stage template | Recommend default work breakdown |
| Workshop schedule and attendance | Yes | Outlook/Teams | Summarize outcomes and unresolved questions |
| Workshop notes | Partly | OneNote/Teams transcript | Extract findings, requirements, decisions, and evidence candidates |
| Evidence requests | Yes | Stage template and requirement/control maps | Detect missing evidence and draft requests |
| Actions | Yes | Planner, Teams commitments, Outlook follow-ups | Suggest owner and due date; human confirms |
| Risks/issues/dependencies | Partly | Planner, Teams, change records, incident feeds | Detect language indicating risk, issue, or dependency |
| Decisions | Partly | Teams meeting transcript, Outlook minutes, OneNote | Draft decision record with options and rationale |
| Requirements | Partly | Discovery notes, approved scope, templates | Propose normalized requirements; never auto-approve |
| Test cases | Partly | Control and configuration templates | Draft test cases from control intent |
| Evidence metadata | Yes | SharePoint file metadata and links | Classify type, sensitivity, and likely requirement mapping |
| Deliverable register | Yes | SharePoint document library and templates | Detect version/state and draft review summary |
| Stage readiness | Yes | Dataverse relationships and review states | Explain likely blockers; cannot approve |
| Status reporting | Yes | Dataverse + Power BI | Generate source-linked narrative |
| Lessons learned | Partly | Close-out notes, defects, risks, decisions | Cluster recurring patterns for review |
| Reusable asset publication | No automatic publication | Knowledge submission | Draft sanitized candidate; mandatory human sanitization/review |

### Integration priorities

**V1:** Dataverse, SharePoint, Teams, Planner.  
**V2:** Outlook, OneNote, Power BI.  
**V3:** Copilot orchestration and cross-source intelligence.

The first integration milestone should eliminate duplicate status reporting and evidence indexing, not attempt to ingest every message or file.

## Challenge 4 — Become a system of intelligence

The Hub should use a three-layer model:

1. **Record layer:** authoritative engagement, work, evidence, decision, approval, and outcome records.
2. **Signal layer:** freshness, completeness, aging, dependency, sentiment, rework, and adoption signals.
3. **Advisory layer:** explainable predictions and recommended actions with source links, timestamp, confidence, and “Validate before use.”

### Priority intelligence products

- **Failure radar:** likely gate failure based on missing mandatory evidence, overdue decisions, unresolved defects, and owner gaps.
- **Decision radar:** overdue decisions ranked by downstream impact and days blocked.
- **Evidence radar:** missing, stale, unreviewed, conflicting, or low-quality evidence.
- **Handoff radar:** operator, runbook, support, training, and acceptance risk.
- **Standard effectiveness:** compare outcomes where a playbook was adopted versus not adopted.
- **Learning radar:** recurring blockers and defects that should become a template, coaching topic, or control update.

No AI output may approve a gate, accept risk, alter scope, publish a deliverable, or publish a reusable asset.

## Challenge 5 — Role-specific experiences

| Role | Key metrics | Top actions | Layout | Alerts | Decisions |
| --- | --- | --- | --- | --- | --- |
| Consultant | Tasks due, evidence requests, blockers, first-pass acceptance | Complete next task, attach/request evidence, escalate blocker | My Work first; one engagement context; minimal forms | Due soon, missing owner, evidence rejected | What to do next and who can unblock |
| Engagement Manager | Gate confidence, scope change, risk aging, decision latency, readiness | Review exceptions, resolve decisions, confirm owners, approve gate | Portfolio + engagement health + gate blockers | No-go risk, overdue approval, scope drift | Advance, hold, escalate, accept condition |
| Practice Manager | Quality trend, rework, adoption, recurring blockers, coaching impact | Prioritize improvements, compare patterns, publish standards | Practice scorecard + cohorts + improvement loop | Failure pattern, low adoption, metric deterioration | Where to invest coaching and standardization |
| Director | Portfolio health, delivery quality, margin/resource proxy, readiness, outcomes | Review exceptions, approve investment, remove systemic blockers | Executive summary + trend + decisions required | Material risk, repeated failure, capacity concern | Resource, investment, escalation, strategic change |

Role filtering is a usability feature. Dataverse teams, roles, field security, and server-side authorization remain the security boundary.

## Challenge 6 — Practice-building framework

Use a closed-loop improvement cycle:

`Observe → Diagnose → Intervene → Adopt → Measure → Institutionalize`

For every improvement action store:

- failure pattern and affected cohort;
- baseline and target;
- owner, intervention, and review cadence;
- source records and evidence;
- adoption rate;
- outcome change;
- decision to scale, revise, retire, or convert to standard.

The Practice Intelligence area should rank:

1. Most frequent failure modes.
2. Highest-cost rework patterns.
3. Assets with strongest outcome improvement.
4. Coaching investments with measured benefit.
5. Engagement patterns with the best readiness and acceptance outcomes.

## Challenge 7 — Product roadmap

### V1 — Governed delivery foundation

**Features:** Dataverse delivery spine, engagement/lifecycle/task model, evidence metadata, stage gates, RAID/decision logs, deliverable states, role security, audit, core dashboards, SharePoint links, Planner task sync.

**Benefit:** One governed place to know what is committed, owned, blocked, proven, and ready.

**Adoption:** Pilot one offering and one engagement pattern; embed in weekly delivery cadence; remove duplicate status reporting.

**Success metrics:** 80% of pilot work items linked to an engagement; 90% owner completeness; 100% mandatory gate criteria visible; 25% less manual status preparation.

### V2 — Automation and integrations

**Features:** Teams/Outlook/OneNote/SharePoint harvesting, automated provisioning, evidence routing, decision extraction, risk aging, Power BI semantic model, reusable-asset workflow.

**Benefit:** Less administrative entry and faster signal detection.

**Adoption:** Integrate only sources with clear permission and value; measure minutes saved per engagement.

**Success metrics:** 40% less duplicate entry; 80% of evidence metadata harvested; 30% faster review routing; fewer stale records.

### V3 — AI delivery intelligence

**Features:** Source-linked summaries, predictive risk/readiness, traceability recommendations, anomaly detection, coaching prompts, natural-language portfolio questions.

**Benefit:** Earlier intervention and more consistent judgment without delegating accountability.

**Adoption:** Human-in-the-loop pilot, confidence thresholds, prompt/output audit, feedback capture.

**Success metrics:** 20% earlier risk detection; 15% lower decision latency; measurable precision/recall for recommendations; zero unauthorized AI approvals.

### V4 — Practice operating system

**Features:** Cross-offering benchmark cohorts, capacity/resource effectiveness, benefits realization, standards lifecycle, outcome economics, ecosystem integrations, practice strategy planning.

**Benefit:** The practice continuously learns and allocates investment based on evidence.

**Adoption:** Quarterly practice reviews; publish standards only from validated outcomes; retire unused assets.

**Success metrics:** improved delivery quality, lower rework, higher asset adoption, shorter time to competency, stronger outcome realization.

## Challenge 8 — Ruthless critique

### Remove or de-emphasize

- The flat 16-module navigation as the primary entry experience.
- Generic “New record” forms that create untyped, weakly related records.
- Hard-coded synthetic metrics presented without a prominent source/lineage distinction.
- Free-form task status changes that do not enforce evidence or transition rules.
- CSV export as a substitute for governed reporting and access-controlled sharing.
- Module summaries that do not expose the next action or business consequence.
- Any implication that local browser storage is a credible production persistence model.

### Missing capabilities

- Universal search across engagement, work, evidence, decision, and asset records.
- Event-driven ingestion and deduplication.
- Relationship-aware record pages.
- Approval inbox and delegated authority.
- Notification preferences and escalation policy.
- Capacity/resource effectiveness view.
- Benefits/outcomes realization.
- Data quality score and lineage.
- Formal accessibility, performance, recovery, and security test evidence.
- Migration, archival, retention, and records disposition.

### Adoption risks

- Consultants perceive another administrative system.
- Managers receive more dashboards but not fewer reporting obligations.
- Directors see polished synthetic metrics and assume operational maturity.
- Practice leaders cannot trust cross-engagement comparisons due to inconsistent definitions.
- Security teams reject the design if UI filtering is mistaken for authorization.
- Teams and SharePoint owners resist ingestion without clear permissions and retention.

### Scalability concerns

- A single broad Dataverse model can become over-normalized and slow without clear bounded contexts.
- Cross-engagement analytics must respect row-level security and avoid leaking restricted content.
- AI context assembly must be permission-aware, source-linked, and cost-controlled.
- Flow-based automation needs idempotency, dead-letter handling, throttling controls, and run observability.
- Global adoption requires localization, regional records rules, time zones, and offering-specific templates.

## Product decisions

1. Build the delivery spine and integrations before adding more modules.
2. Measure administrative effort removed, not only records created.
3. Make every insight actionable and explainable.
4. Design for role-based work queues, not dashboard consumption alone.
5. Treat reusable knowledge as a governed product with adoption evidence.
6. Keep human accountability explicit at every decision boundary.
