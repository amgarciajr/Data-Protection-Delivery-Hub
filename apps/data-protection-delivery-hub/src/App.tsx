import { useEffect, useMemo, useState, type FormEvent } from "react";
import seed from "./data/seed.json";
import { addPracticeImprovement, addRecord, evidenceChainNodeLabels, generateProjectStatusReport, generateStageDocumentation, getAuditEvents, getConnectionReadiness, getEvidenceChains, getPracticeImprovements, getRecords, getRuntimeConfig, getWorkTasks, metricHistory, qualityMetrics, repositoryConfig, reusableAssets, stageDocumentationSections, stageTemplates, updateWorkTask, updateWorkTaskStatus, upsertWorkTaskFromSignal, type EvidenceChain, type EvidenceChainDecision, type EvidenceChainNode, type EvidenceChainRisk, type HubRecord, type PracticeImprovement, type RuntimeMode, type StageDocumentationSectionId, type StageDocumentationSectionSelection, type WorkTask, type WorkTaskStatus } from "./data/repository";
import "./index.css";

const nav = [
  "Command Center",
  "My Work",
  "Pipeline & Intake",
  "Engagements",
  "Discovery & Assessment",
  "Scope & Requirements",
  "Architecture & Controls",
  "Delivery Execution",
  "RAID & Decisions",
  "Testing & Evidence",
  "Readiness & Assurance",
  "Deliverables",
  "Transition & Operations",
  "Knowledge & Reuse",
  "Practice Intelligence",
  "Administration",
] as const;

type ModuleName = (typeof nav)[number];
type Zone = "Start" | "Deliver" | "Prove" | "Transition" | "Improve";
type Role = "Consultant" | "Workstream Lead" | "Architect" | "Project Manager" | "Engagement Manager" | "Reviewer" | "Practice Leader" | "Platform Administrator";
type Language = "English" | "Español";
type DemoMode = "standard" | "walkthrough";
type ResolutionPlan = {
  severity?: string;
  why: string;
  evidence: string;
  impact: string;
  owner: string;
  dueDate: string;
  steps: string[];
  resolvedWhen: string;
};

type DetailTarget = { title: string; summary: string; action?: string; onAction?: () => void; resolution?: ResolutionPlan };

const zoneModules: Record<Zone, ModuleName[]> = {
  Start: ["Command Center", "My Work"],
  Deliver: ["Pipeline & Intake", "Engagements", "Discovery & Assessment", "Scope & Requirements", "Delivery Execution", "RAID & Decisions"],
  Prove: ["Architecture & Controls", "Testing & Evidence", "Readiness & Assurance"],
  Transition: ["Deliverables", "Transition & Operations"],
  Improve: ["Knowledge & Reuse", "Practice Intelligence", "Administration"],
};

const zones = Object.keys(zoneModules) as Zone[];

// Every role must have at least one reachable module in every Experience zone
// (Start, Deliver, Prove, Transition, Improve). Missing coverage leaves the
// zone's sidebar empty and the previously viewed module stuck on screen when
// clicked, so any change here should re-check zoneModules coverage per role.
const roleModules: Record<Role, ModuleName[]> = {
  Consultant: ["Command Center", "My Work", "Engagements", "Discovery & Assessment", "Testing & Evidence", "Transition & Operations", "Knowledge & Reuse"],
  "Workstream Lead": ["Command Center", "My Work", "Engagements", "Scope & Requirements", "Architecture & Controls", "Delivery Execution", "Testing & Evidence", "Deliverables", "Knowledge & Reuse"],
  Architect: ["Command Center", "My Work", "Engagements", "Architecture & Controls", "RAID & Decisions", "Readiness & Assurance", "Deliverables", "Knowledge & Reuse"],
  "Project Manager": ["Command Center", "My Work", "Pipeline & Intake", "Engagements", "Scope & Requirements", "Delivery Execution", "RAID & Decisions", "Readiness & Assurance", "Deliverables", "Knowledge & Reuse"],
  "Engagement Manager": ["Command Center", "My Work", "Pipeline & Intake", "Engagements", "RAID & Decisions", "Readiness & Assurance", "Deliverables", "Transition & Operations", "Practice Intelligence"],
  Reviewer: ["Command Center", "My Work", "RAID & Decisions", "Testing & Evidence", "Readiness & Assurance", "Deliverables", "Knowledge & Reuse"],
  "Practice Leader": ["Command Center", "Engagements", "Readiness & Assurance", "Deliverables", "Knowledge & Reuse", "Practice Intelligence"],
  "Platform Administrator": [...nav],
};

const roleOptions = Object.keys(roleModules) as Role[];

const roleValue = {
  Consultant: { title: "Move delivery forward faster", benefit: "Capture evidence once, reduce status reporting, and see exactly what done means.", actions: [{ label: "Complete next assigned task", module: "My Work" as ModuleName }, { label: "Attach or request evidence", module: "Testing & Evidence" as ModuleName }, { label: "Escalate a blocker", module: "RAID & Decisions" as ModuleName }] },
  "Engagement Manager": { title: "Know whether the engagement is safe to advance", benefit: "See scope drift, risks, readiness, decisions, and handoff confidence in one review.", actions: [{ label: "Review gate blockers", module: "Readiness & Assurance" as ModuleName }, { label: "Resolve overdue decisions", module: "RAID & Decisions" as ModuleName }, { label: "Confirm readiness", module: "Readiness & Assurance" as ModuleName }] },
  "Practice Leader": { title: "Scale what works across engagements", benefit: "Identify recurring failure patterns, adoption of standards, and where coaching creates leverage.", actions: [{ label: "Review quality trends", module: "Practice Intelligence" as ModuleName }, { label: "Prioritize improvement actions", module: "Practice Intelligence" as ModuleName }, { label: "Publish reusable assets", module: "Knowledge & Reuse" as ModuleName }] },
  "Project Manager": { title: "Keep delivery controlled and predictable", benefit: "Coordinate milestones, dependencies, changes, deliverables, and ownership without rebuilding reports.", actions: [{ label: "Review milestone health", module: "Delivery Execution" as ModuleName }, { label: "Manage scope changes", module: "Scope & Requirements" as ModuleName }, { label: "Prepare status narrative", module: "Engagements" as ModuleName }] },
  Architect: { title: "Make decisions traceable and reusable", benefit: "Connect architecture choices to controls, exceptions, tests, evidence, and downstream impact.", actions: [{ label: "Resolve design decisions", module: "RAID & Decisions" as ModuleName }, { label: "Review control mappings", module: "Architecture & Controls" as ModuleName }, { label: "Coach decision quality", module: "Practice Intelligence" as ModuleName }] },
  "Workstream Lead": { title: "Turn work into reviewable outcomes", benefit: "Organize requirements, configuration, tests, evidence, and defects around a clear definition of done.", actions: [{ label: "Close traceability gaps", module: "Scope & Requirements" as ModuleName }, { label: "Route evidence for review", module: "Testing & Evidence" as ModuleName }, { label: "Re-sequence blocked work", module: "Delivery Execution" as ModuleName }] },
  Reviewer: { title: "Review the proof, not the story", benefit: "Focus on evidence quality, deliverable review states, and the criteria that determine readiness.", actions: [{ label: "Review evidence queue", module: "Testing & Evidence" as ModuleName }, { label: "Disposition defects", module: "Testing & Evidence" as ModuleName }, { label: "Approve or return deliverables", module: "Deliverables" as ModuleName }] },
  "Platform Administrator": { title: "Keep the operating model governed", benefit: "Manage reference data, roles, stage criteria, integrations, audit, and support readiness.", actions: [{ label: "Review configuration", module: "Administration" as ModuleName }, { label: "Validate security boundaries", module: "Administration" as ModuleName }, { label: "Monitor automation health", module: "Administration" as ModuleName }] },
} satisfies Record<Role, { title: string; benefit: string; actions: { label: string; module: ModuleName }[] }>;

const lifecycleStages = [
  { stage: "Qualify", output: "Accepted opportunity" },
  { stage: "Initiate", output: "Charter and team" },
  { stage: "Discover", output: "Evidence-backed findings" },
  { stage: "Assess", output: "Prioritized recommendations" },
  { stage: "Design", output: "Approved design and controls" },
  { stage: "Build", output: "Validated configuration" },
  { stage: "Validate", output: "Accepted evidence and tests" },
  { stage: "Transition", output: "Operational handoff" },
  { stage: "Close", output: "Accepted outcomes" },
  { stage: "Operate", output: "Benefits and lessons" },
];

const descriptions: Record<ModuleName, string> = {
  "Command Center": "Portfolio dashboard for health, readiness, evidence, and delivery signals.",
  "My Work": "Assigned actions, reviews, approvals, risks, evidence requests, and milestones.",
  "Pipeline & Intake": "Qualification, offering alignment, delivery risk, and sales-to-delivery handoff.",
  Engagements: "Charter, stages, workstreams, stakeholders, scope, and health.",
  "Discovery & Assessment": "Workshops, responses, maturity, findings, and recommendations.",
  "Scope & Requirements": "Boundaries, requirements, acceptance criteria, changes, and traceability.",
  "Architecture & Controls": "Architecture decisions, controls, configuration specifications, and exceptions.",
  "Delivery Execution": "Milestones, actions, dependencies, blockers, changes, and defects.",
  "RAID & Decisions": "Risks, assumptions, issues, dependencies, and decision governance.",
  "Testing & Evidence": "Test plans, test cases, results, defects, evidence, and traceability.",
  "Readiness & Assurance": "Mandatory criteria, dimension scoring, exceptions, and release recommendation.",
  Deliverables: "Review, approval, version, authoritative links, delivery, and acceptance.",
  "Transition & Operations": "Operators, support, training, runbooks, handoff, hypercare, and acceptance.",
  "Knowledge & Reuse": "Lessons, sanitized patterns, playbooks, templates, and asset publication.",
  "Practice Intelligence": "Portfolio trends, quality, reuse, readiness, risks, and outcomes.",
  Administration: "Catalogs, templates, gates, role mapping, workflow configuration, and audit.",
};

const stageGates = [
  { name: "Validate & Assure", status: "Amber", owner: "Engagement Manager", note: "Two tests hold a conditional go" },
  { name: "Transition", status: "Green", owner: "Operations Lead", note: "Runbooks and support owners confirmed" },
  { name: "Design", status: "Red", owner: "Architect", note: "Exception approval pending" },
];

const lifecycleSignals = [
  { title: "Evidence completeness", value: "76%", tone: "Green", detail: "76% of required evidence across active engagements has been submitted and reviewed. Open items are tracked in Readiness & Assurance.", module: "Readiness & Assurance" as ModuleName },
  { title: "Ready for release", value: "3 of 7", tone: "Amber", detail: "3 of 7 tracked release criteria are currently Green. Review mandatory criteria and exceptions in Readiness & Assurance.", module: "Readiness & Assurance" as ModuleName },
  { title: "Actionable risks", value: "11", tone: "Red", detail: "11 open risk and decision items need an owner action. Review and mitigate them in RAID & Decisions.", module: "RAID & Decisions" as ModuleName },
];

const readinessCriteria = [
  { name: "Mandatory tests passed", owner: "Workstream Lead", status: "Green", mandatory: true },
  { name: "Evidence reviewed", owner: "Reviewer", status: "Amber", mandatory: true },
  { name: "Open defects dispositioned", owner: "Workstream Lead", status: "Green", mandatory: true },
  { name: "Operational owner confirmed", owner: "Engagement Manager", status: "Green", mandatory: true },
  { name: "Training and support ready", owner: "Operations Lead", status: "Amber", mandatory: false },
];

const adminCatalogs = [
  { name: "Offering catalog", entries: "8 active", owner: "Practice Leader", status: "Green" },
  { name: "Stage-gate criteria", entries: "10 stages", owner: "Engagement Manager", status: "Green" },
  { name: "Risk taxonomy", entries: "4 severity levels", owner: "Platform Administrator", status: "Green" },
  { name: "Retention categories", entries: "6 configured", owner: "Data Owner", status: "Amber" },
];

const roleMappings = [
  { role: "Consultant", scope: "Assigned engagements", approvals: "None" },
  { role: "Workstream Lead", scope: "Led workstreams", approvals: "Delivery records" },
  { role: "Architect", scope: "Assigned/consulted engagements", approvals: "Design and controls" },
  { role: "Engagement Manager", scope: "Managed engagements", approvals: "Gates and acceptance" },
  { role: "Reviewer", scope: "Explicitly assigned reviews", approvals: "Evidence and deliverables" },
  { role: "Platform Administrator", scope: "Platform configuration", approvals: "None by default" },
];

const moduleDetailMap: Record<ModuleName, { summary: string; controls: string[]; actions: string[]; records: { title: string; value: string }[] }> = {
  "Command Center": {
    summary: "Portfolio dashboard for evidence-backed decision-making and operational oversight.",
    controls: ["Engagement health", "Risk aging", "Evidence completeness"],
    actions: ["Review portfolio risk", "Prioritize overdue decisions", "Validate evidence coverage"],
    records: [
      { title: "Signal strength", value: "88%" },
      { title: "Overdue decisions", value: "3" },
      { title: "Approved exceptions", value: "2" },
    ],
  },
  "My Work": {
    summary: "Manage the current execution queue for approvals, risks, evidence requests, and milestones.",
    controls: ["Assigned actions by owner", "Evidence review routing", "Milestone health snapshots"],
    actions: ["Review overdue approvals", "Confirm evidence ownership", "Refresh risk register"],
    records: [
      { title: "Assigned to me", value: "12" },
      { title: "Awaiting review", value: "5" },
      { title: "Milestones due", value: "4" },
    ],
  },
  "Pipeline & Intake": {
    summary: "Qualify new opportunities and normalize the intake to the accepted delivery offering.",
    controls: ["Opportunity qualification", "Offering prerequisites", "Sales-to-delivery handoff"],
    actions: ["Validate objectives and drivers", "Confirm delivery risk", "Accept handoff checklist"],
    records: [
      { title: "Open opportunities", value: "9" },
      { title: "Approved handoffs", value: "4" },
      { title: "At-risk qualifications", value: "2" },
    ],
  },
  Engagements: {
    summary: "Drive each engagement from charter through close with a governed stage and ownership model.",
    controls: ["Stage health tracking", "Stakeholder matrix", "Workstream ownership"],
    actions: ["Review charter scope", "Confirm stage gate readiness", "Update workstream status"],
    records: [
      { title: "Live engagements", value: "7" },
      { title: "In design stage", value: "2" },
      { title: "High-health portfolio", value: "3" },
    ],
  },
  "Discovery & Assessment": {
    summary: "Capture workshop input, findings, recommendations, and evidence-backed assessment output.",
    controls: ["Workshop register", "Assessment evidence", "Finding review"],
    actions: ["Capture discover outputs", "Review maturity responses", "Track recommendation owners"],
    records: [
      { title: "Open findings", value: "18" },
      { title: "Validated recommendations", value: "11" },
      { title: "Workshop backlog", value: "3" },
    ],
  },
  "Scope & Requirements": {
    summary: "Separate in-scope commitments from exclusions, constraints, and change-driven drift.",
    controls: ["Traceable requirements", "Scope change control", "Acceptance criteria"],
    actions: ["Resolve orphaned requirements", "Confirm scope boundaries", "Approve change impact"],
    records: [
      { title: "Requirements", value: "146" },
      { title: "Approved changes", value: "9" },
      { title: "Orphan gaps", value: "2" },
    ],
  },
  "Architecture & Controls": {
    summary: "Document design options, architecture decisions, and the control pattern for each engagement.",
    controls: ["Architecture decision log", "Control catalogue", "Exception approvals"],
    actions: ["Approve control design", "Review rollback plan", "Confirm compensating controls"],
    records: [
      { title: "Architecture decisions", value: "31" },
      { title: "Active exceptions", value: "4" },
      { title: "Control mappings", value: "89" },
    ],
  },
  "Delivery Execution": {
    summary: "Run the workstreams, action backlog, blockers, and milestone progress in a controlled cadence.",
    controls: ["Milestone tracking", "Dependency visibility", "Defect routing"],
    actions: ["Review blockers", "Re-sequence milestones", "Report change impact"],
    records: [
      { title: "Actions open", value: "27" },
      { title: "Blocked tasks", value: "5" },
      { title: "Dependencies", value: "16" },
    ],
  },
  "RAID & Decisions": {
    summary: "Track risk, assumptions, issues, dependencies, and the decisions that affect delivery outcomes.",
    controls: ["Risk aging", "Decision ownership", "Escalation review"],
    actions: ["Validate risk mitigations", "Review overdue decisions", "Escalate unresolved blockers"],
    records: [
      { title: "Critical risks", value: "2" },
      { title: "Open decisions", value: "5" },
      { title: "Escalated items", value: "3" },
    ],
  },
  "Testing & Evidence": {
    summary: "Connect test results to evidence and ensure the proof chain supports validation and readiness.",
    controls: ["Test coverage mapping", "Evidence review", "Defect follow-through"],
    actions: ["Review failed tests", "Confirm evidence quality", "Route accepted evidence"],
    records: [
      { title: "Test cases", value: "224" },
      { title: "Evidence pending review", value: "12" },
      { title: "Defects open", value: "7" },
    ],
  },
  "Readiness & Assurance": {
    summary: "Evaluate mandatory criteria and show whether the engagement is ready to proceed or requires conditions.",
    controls: ["Weighted scoring", "Mandatory criteria gate", "Release recommendation"],
    actions: ["Assess gate criteria", "Capture exceptions", "Confirm release status"],
    records: [
      { title: "Gate reviews", value: "14" },
      { title: "Amber gates", value: "5" },
      { title: "Go with conditions", value: "3" },
    ],
  },
  Deliverables: {
    summary: "Coordinate output delivery, review flow, approval, and controlled handoff to the customer.",
    controls: ["Delivery workflows", "Review states", "Authoritative links"],
    actions: ["Approve draft deliverables", "Confirm version control", "Track customer acceptance"],
    records: [
      { title: "Deliverables", value: "23" },
      { title: "Customer review", value: "7" },
      { title: "Approved", value: "9" },
    ],
  },
  "Transition & Operations": {
    summary: "Prepare structured support, named owners, operator readiness, and follow-up validation.",
    controls: ["Runbooks", "Escalation routes", "Hypercare planning"],
    actions: ["Confirm operators", "Review support model", "Approve handoff acceptance"],
    records: [
      { title: "Operational owners", value: "11" },
      { title: "Runbooks ready", value: "8" },
      { title: "Acceptance pending", value: "3" },
    ],
  },
  "Knowledge & Reuse": {
    summary: "Sanitize delivery lessons, package reusable assets, and support practice learning without exposing client data.",
    controls: ["Sanitization review", "Reusable asset publication", "Lessons learning"],
    actions: ["Review lessons", "Sanitize reusable content", "Publish vetted playbooks"],
    records: [
      { title: "Reusable assets", value: "19" },
      { title: "Published this quarter", value: "6" },
      { title: "Sanitization pending", value: "2" },
    ],
  },
  "Practice Intelligence": {
    summary: "Provide portfolio insight and signal quality trends without exposing restricted engagement content.",
    controls: ["Portfolio dashboards", "Offering filters", "Outcome tracking"],
    actions: ["Review trend anomalies", "Compare readiness by offering", "Monitor reuse scorecards"],
    records: [
      { title: "Offering cohorts", value: "8" },
      { title: "Quality trend score", value: "82" },
      { title: "Reuse rate", value: "64%" },
    ],
  },
  Administration: {
    summary: "Maintain the operating catalog, governance settings, security mappings, and platform controls.",
    controls: ["Offering catalog", "Role mapping", "Stage gate criteria"],
    actions: ["Review governance settings", "Publish template updates", "Validate platform configuration"],
    records: [
      { title: "Reference resets", value: "4" },
      { title: "Roles mapped", value: "16" },
      { title: "Environment variables", value: "22" },
    ],
  },
};

function Pill({ v }: { v: string }) {
  return <span className={`pill ${v}`}>{v}</span>;
}

function DetailModal({ detail, onClose }: { detail: DetailTarget; onClose: () => void }) {
  return (
    <div className="detail-backdrop" role="presentation" onClick={onClose}>
      <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}>
        <div className="label accent">Interactive detail</div>
        <h2 id="detail-title">{detail.title}</h2>
        <p>{detail.summary}</p>
        {detail.resolution && (
          <div className="resolution-plan">
            <div className="resolution-grid">
              <div><span className="label">Why categorized</span><strong>{detail.resolution.severity ?? "Signal"}</strong><p>{detail.resolution.why}</p></div>
              <div><span className="label">Evidence observed</span><p>{detail.resolution.evidence}</p></div>
              <div><span className="label">Impact if unresolved</span><p>{detail.resolution.impact}</p></div>
              <div><span className="label">Accountable owner / due</span><p>{detail.resolution.owner} · {detail.resolution.dueDate}</p></div>
            </div>
            <div className="resolution-steps">
              <span className="label">Resolution steps</span>
              <ol>{detail.resolution.steps.map((step) => <li key={step}>{step}</li>)}</ol>
            </div>
            <div className="resolution-outcome"><strong>Resolved when:</strong> {detail.resolution.resolvedWhen}</div>
          </div>
        )}
        <div className="detail-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Close</button>
          {detail.action && detail.onAction && <button className="primary-button" type="button" onClick={() => { detail.onAction?.(); onClose(); }}>{detail.action}</button>}
        </div>
      </section>
    </div>
  );
}

function signalTaskAction(
  signal: { id: string; type: "Risk" | "Decision"; title: string; owner: string; dueDate: string; stage: string; blocker: string; expectedOutcome: string },
  onOpenMyWork: () => void,
) {
  upsertWorkTaskFromSignal({ recordId: signal.id, recordType: signal.type, title: signal.title, owner: signal.owner, dueDate: signal.dueDate, stage: signal.stage, blocker: signal.blocker, expectedOutcome: signal.expectedOutcome });
  onOpenMyWork();
}

function recordResolution(record: HubRecord, moduleName: string): ResolutionPlan {
  if (record.status === "Green") {
    return {
      severity: "On track",
      why: `${record.title} in ${moduleName} has current ownership and an accepted, up-to-date review.`,
      evidence: `Last reviewed ${record.lastReviewed} by ${record.owner}; current value ${record.value}.`,
      impact: "No action is required right now; the record only needs routine monitoring to stay current.",
      owner: record.owner,
      dueDate: "Next scheduled review",
      steps: [
        "Confirm the value and owner are still accurate at the next review cadence.",
        "Re-review before the next stage gate or milestone that depends on this record.",
      ],
      resolvedWhen: "already resolved — keep monitoring at the standard review cadence so it does not slip to Amber or Red.",
    };
  }
  return resolutionFor(record.title, record.owner, "Next scheduled review", record.status === "Red" ? "Blocked" : "Needs attention");
}

function resolutionFor(title: string, owner: string, dueDate: string, severity = "Action required"): ResolutionPlan {
  const design = title.toLowerCase().includes("design") || title.toLowerCase().includes("exception");
  return {
    severity,
    why: design
      ? "The required approval or compensating control is missing or overdue."
      : "Required delivery information or evidence is incomplete for the current lifecycle gate.",
    evidence: design
      ? "Decision rationale, exception record, compensating control, and expiry are not yet accepted."
      : "The linked work item, authoritative evidence, or owner confirmation is not yet accepted.",
    impact: "The engagement cannot safely advance this gate and the unresolved condition increases rework or handoff risk.",
    owner,
    dueDate,
    steps: [
      "Confirm the accountable owner and due date.",
      "Open or update the linked My Work task with the expected outcome and definition of done.",
      "Attach the authoritative evidence link and submit it for review.",
      "Record the decision, approval, rationale, and any escalation.",
      "Re-evaluate the gate after evidence is accepted and the blocker is cleared.",
    ],
    resolvedWhen: design
      ? "an authorized approver accepts the rationale, compensating control, expiry, and evidence."
      : "the owner completes the task, evidence is Accepted, required approval is recorded, and no blocker remains.",
  };
}

function InfoTip({ text }: { text: string }) {
  return <span className="info-tip" tabIndex={0} aria-label={text}>i<span role="tooltip">{text}</span></span>;
}

const glossary: { term: string; meaning: string }[] = [
  { term: "RAID", meaning: "Risks, Assumptions, Issues, and Decisions — the register used to track anything that could affect delivery and to record who resolved it and why." },
  { term: "Gate / stage gate", meaning: "A checkpoint between lifecycle stages. Work only advances when the required evidence, ownership, and approval are satisfied — protecting the next stage from unresolved problems." },
  { term: "Evidence chain", meaning: "The traceable path from a requirement to the evidence gathered, its review outcome, and the task or decision it is linked to — proof of why a status is what it is." },
  { term: "Readiness", meaning: "Whether required evidence, tests, ownership, support, and mandatory criteria are all satisfied so the team can move forward with confidence." },
  { term: "Delivery Quality Index (DQI)", meaning: "A single 0–100 score combining acceptance rates, recurring blockers, and stage-gate escapes into one delivery-quality signal leadership can track over time." },
  { term: "Stage-gate escape rate", meaning: "The percentage of items that pass a stage gate but are later found incomplete, defective, or reworked — a lower number means gates are catching problems earlier." },
  { term: "Reusable asset adoption", meaning: "The percentage of engagements or teams using standardized templates and playbooks instead of rebuilding work from scratch — higher adoption means faster, more consistent delivery." },
  { term: "Recurring blocker rate", meaning: "The percentage of blockers or issues that repeat across engagements, signaling a systemic gap in process or standards rather than a one-off problem." },
  { term: "Zones (Start · Deliver · Prove · Transition · Improve)", meaning: "The five journey groupings of workspaces that mirror the engagement lifecycle, from kickoff through continuous improvement." },
  { term: "Demo mode vs. Live mode", meaning: "Demo mode uses synthetic seed data saved locally in this browser. Live mode requires an approved, governed data connector before it can be used." },
];

function HelpGuide({ role, onOpenModule, onClose, onStartWalkthrough }: { role: Role; onOpenModule: (page: ModuleName) => void; onClose: () => void; onStartWalkthrough: () => void }) {
  const [tab, setTab] = useState<"start" | "role" | "glossary" | "areas">("start");
  const myValue = roleValue[role];
  const tabs: { id: typeof tab; label: string }[] = [
    { id: "start", label: "Getting started" },
    { id: "role", label: "Roles & what you can do" },
    { id: "glossary", label: "Glossary" },
    { id: "areas", label: "Areas of the Hub" },
  ];
  return (
    <div className="settings-backdrop" role="presentation" onClick={onClose}>
      <section className="settings-pane help-pane" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
        <div className="settings-header">
          <div><div className="label">Help &amp; guide</div><h2 id="help-title">Learn the Hub</h2></div>
          <button type="button" className="close-button" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <p className="help-intro">Built for every level — new hires learning delivery for the first time, practitioners doing daily work, and directors who need the story fast.</p>
        <div className="help-tabs" role="tablist" aria-label="Help topics">
          {tabs.map((item) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>
          ))}
        </div>

        {tab === "start" && (
          <div className="help-body">
            <h3>New here? Start with these three steps</h3>
            <div className="guided-steps">
              <div><strong>1 · See the signal</strong><span>Command Center surfaces what needs attention before the status meeting — risks, decisions, evidence gaps, and readiness.</span></div>
              <div><strong>2 · Trace the source</strong><span>Click any card, signal, or lifecycle stage to see its owner, timing, context, and the record behind it.</span></div>
              <div><strong>3 · Move the work</strong><span>Open the right workspace, assign the next action in My Work, attach evidence, and record the decision.</span></div>
            </div>
            <h3>Quick tips</h3>
            <ul className="help-tip-list">
              <li>Hover or focus any small <span className="info-tip-inline">i</span> icon next to a heading for a plain-language explanation.</li>
              <li>The sidebar is grouped by journey zone (Start → Deliver → Prove → Transition → Improve) so you always know where you are in the lifecycle.</li>
              <li>Use the search box in the header to jump straight to a workspace by name or description.</li>
              <li>Switch your role in Settings to preview exactly what a Consultant, Architect, Engagement Manager, or Director sees.</li>
              <li>Everything in this demo runs on synthetic data saved to your browser — nothing here is a live production system.</li>
            </ul>
            <button type="button" className="primary-button" onClick={() => { onClose(); onStartWalkthrough(); }}>Run the guided leadership walkthrough</button>
          </div>
        )}

        {tab === "role" && (
          <div className="help-body">
            <h3>Your current role: {role}</h3>
            <p><strong>{myValue.title}.</strong> {myValue.benefit}</p>
            <div className="help-role-actions">
              {myValue.actions.map((action) => (
                <button type="button" key={action.label} className="secondary-button" onClick={() => { onOpenModule(action.module); onClose(); }}>{action.label}</button>
              ))}
            </div>
            <h3>What every role focuses on</h3>
            <div className="help-role-grid">
              {roleOptions.map((option) => (
                <div key={option} className={option === role ? "help-role-card current" : "help-role-card"}>
                  <strong>{option}{option === role ? " (you)" : ""}</strong>
                  <p>{roleValue[option].title}</p>
                  <small>{roleValue[option].benefit}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "glossary" && (
          <div className="help-body">
            <h3>Terms used across the Hub</h3>
            <dl className="help-glossary">
              {glossary.map((entry) => (
                <div key={entry.term}>
                  <dt>{entry.term}</dt>
                  <dd>{entry.meaning}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {tab === "areas" && (
          <div className="help-body">
            <h3>What each workspace is for</h3>
            <p>Select any workspace to open it directly.</p>
            <div className="help-areas-grid">
              {nav.filter((item) => roleModules[role].includes(item)).map((item) => (
                <button type="button" key={item} className="help-area-card" onClick={() => { onOpenModule(item); onClose(); }}>
                  <strong>{item}</strong>
                  <span>{descriptions[item]}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function GuidedWelcome({ onClose }: { onClose: () => void }) {
  return (
    <div className="guided-backdrop" role="presentation">
      <section className="guided-card" role="dialog" aria-modal="true" aria-labelledby="guided-title">
        <div className="guided-kicker">Welcome to the Hub</div>
        <h2 id="guided-title">A guided way to move delivery forward</h2>
        <p>Start with the action in front of you, prove it with evidence, and use the lifecycle to make readiness and handoff clear.</p>
        <div className="guided-steps">
          <div><strong>1 · Start</strong><span>Use Command Center or My Work to see what needs attention.</span></div>
          <div><strong>2 · Deliver</strong><span>Keep the engagement, owner, stage, and next outcome in context.</span></div>
          <div><strong>3 · Prove</strong><span>Connect decisions and evidence before moving through a gate.</span></div>
        </div>
        <button className="primary-button" type="button" onClick={onClose}>Start exploring</button>
      </section>
    </div>
  );
}

const walkthroughSteps = [
  { title: "Start with Command Center", body: "This is the leadership view. It brings engagement health, risks, decisions, evidence completeness, and release readiness into one conversation.", page: "Command Center" as ModuleName },
  { title: "Follow the lifecycle", body: "The lifecycle shows what each stage must produce before the team advances. Select a stage's orange i to read its expected output.", page: "Command Center" as ModuleName },
  { title: "Move from signal to action", body: "My Work turns the signals into owned tasks with evidence, definitions of done, due dates, and escalation paths.", page: "My Work" as ModuleName },
  { title: "Prove and improve", body: "Use the Prove, Transition, and Improve zones to review evidence, prepare handoff, and turn lessons into reusable practice improvements.", page: "Testing & Evidence" as ModuleName },
];

function DemoWalkthrough({ step, onNext, onClose, onNavigate }: { step: number; onNext: () => void; onClose: () => void; onNavigate: (page: ModuleName) => void }) {
  const current = walkthroughSteps[step];
  return (
    <div className="guided-backdrop" role="presentation">
      <section className="guided-card walkthrough-card" role="dialog" aria-modal="true" aria-labelledby="walkthrough-title">
        <div className="guided-kicker">Leadership demo · {step + 1} of {walkthroughSteps.length}</div>
        <h2 id="walkthrough-title">{current.title}</h2>
        <p>{current.body}</p>
        <div className="walkthrough-progress" aria-label={`Demo step ${step + 1} of ${walkthroughSteps.length}`}>
          {walkthroughSteps.map((item, index) => <span key={item.title} className={index === step ? "active" : ""} />)}
        </div>
        <div className="walkthrough-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Exit walkthrough</button>
          {step < walkthroughSteps.length - 1 ? (
            <button className="primary-button" type="button" onClick={() => { onNavigate(walkthroughSteps[step + 1].page); onNext(); }}>Next</button>
          ) : (
            <button className="primary-button" type="button" onClick={onClose}>Finish demo</button>
          )}
        </div>
      </section>
    </div>
  );
}

function PracticeImprovementPanel({ improvements, onAdded, onSelect, onOpenModule }: { improvements: PracticeImprovement[]; onAdded: (item: PracticeImprovement) => void; onSelect: (detail: DetailTarget) => void; onOpenModule: (page: ModuleName) => void }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [owner, setOwner] = useState("");
  const [target, setTarget] = useState("");

  function saveImprovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !problem.trim() || !owner.trim() || !target.trim()) return;
    onAdded(addPracticeImprovement({
      title: title.trim(),
      problem: problem.trim(),
      owner: owner.trim(),
      target: target.trim(),
      baseline: "New baseline to capture",
      impact: "To be assessed",
    }));
    setTitle("");
    setProblem("");
    setOwner("");
    setTarget("");
    setShowForm(false);
  }

  return (
    <div className="card practice-card">
      <div className="records-heading">
        <div>
          <h2>Practice improvement</h2>
          <p className="muted">Turn delivery evidence into better standards, coaching, and reusable ways of working.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => setShowForm((current) => !current)}>
          {showForm ? "Cancel" : "Add improvement"}
        </button>
      </div>
      <div className="practice-metrics">
        {qualityMetrics.map((metric) => (
          <button
            type="button"
            className="practice-metric interactive-card"
            key={metric.id}
            onClick={() => onSelect({
              title: metric.name,
              summary: `Current value ${metric.actual}${metric.unit === "%" ? "%" : ""} for ${metric.period} against a target of ${metric.target}${metric.unit === "%" ? "%" : ""}. This measure is calculated from linked work, evidence, and review records across active engagements.`,
              action: "Open Practice Intelligence",
              onAction: () => onOpenModule("Practice Intelligence"),
            })}
          >
            <span className="label">{metric.name}</span>
            <strong className={`practice-value ${metric.actual >= metric.target === (metric.direction === "up") ? "Green" : "Amber"}`}>
              {metric.actual}{metric.unit === "%" ? "%" : ""}
            </strong>
            <small>{metric.period} · target {metric.target}{metric.unit === "%" ? "%" : ""}</small>
          </button>
        ))}
      </div>
      {showForm && (
        <form className="improvement-form" onSubmit={saveImprovement}>
          <label>Improvement title<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
          <label>Problem statement<input required value={problem} onChange={(event) => setProblem(event.target.value)} /></label>
          <label>Owner<input required value={owner} onChange={(event) => setOwner(event.target.value)} /></label>
          <label>Target measure<input required value={target} onChange={(event) => setTarget(event.target.value)} /></label>
          <button className="primary-button" type="submit">Save improvement</button>
        </form>
      )}
      <div className="practice-actions">
        {improvements.map((action) => (
          <button
            type="button"
            className="practice-action interactive-list-item"
            key={action.id}
            onClick={() => onSelect({
              title: action.title,
              summary: `${action.problem} Owned by ${action.owner}; baseline ${action.baseline}, target ${action.target}. Status: ${action.status}. Source: ${action.source}.`,
              resolution: resolutionFor(action.title, action.owner, action.reviewDate, action.status === "Complete" ? "On track" : action.status === "Planned" ? "Blocked" : "Needs attention"),
              action: "Create/update My Work task",
              onAction: () => signalTaskAction(
                { id: action.id, type: "Decision", title: `Advance improvement: ${action.title}`, owner: action.owner, dueDate: action.reviewDate, stage: "Improve", blocker: action.problem, expectedOutcome: `${action.title} reaches its target (${action.target}).` },
                () => onOpenModule("My Work"),
              ),
            })}
          >
            <div>
              <strong>{action.title}</strong>
              <p>{action.problem}</p>
              <small>{action.owner} · baseline {action.baseline} · target {action.target}</small>
            </div>
            <Pill v={action.status === "Complete" ? "Green" : action.status === "Planned" ? "Red" : "Amber"} />
          </button>
        ))}
      </div>
    </div>
  );
}

function downloadCsv(page: ModuleName, records: HubRecord[]) {
  const rows = [
    ["Record", "Current value", "Owner", "Status", "Last reviewed"],
    ...records.map((record) => [
      record.title,
      record.value,
      record.owner,
      record.status,
      record.lastReviewed,
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${page.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-records.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadTextFile(filename: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${mime};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Opens the user's default mail client with the report prefilled. This is a client-side,
// no-auth convenience — it does not call Microsoft Graph and cannot post to Teams directly.
// Most mail clients truncate very long mailto bodies, so long reports are trimmed with a
// pointer back to the downloadable file. Real Outlook/Teams data gathering and posting is
// documented as a future adapter in docs/ADAPTER_CONTRACT.md.
function buildMailtoLink(subject: string, body: string) {
  const maxBodyLength = 1800;
  const safeBody = body.length > maxBodyLength
    ? `${body.slice(0, maxBodyLength)}\n\n[Report truncated for email length — use Download to attach the full file.]`
    : body;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(safeBody)}`;
}

function App() {
  const [page, setPage] = useState<ModuleName>("Command Center");
  const [zone, setZone] = useState<Zone>("Start");
  const [engagementId, setEngagementId] = useState(seed.engagements[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => (window.localStorage.getItem("dpdh-theme") as "light" | "dark") || "light");
  const [role, setRole] = useState<Role>(() => (window.localStorage.getItem("dpdh-role") as Role) || "Engagement Manager");
  const [language, setLanguage] = useState<Language>(() => (window.localStorage.getItem("dpdh-language") as Language) || "English");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>(repositoryConfig.runtimeMode);
  const [guided, setGuided] = useState(() => window.localStorage.getItem("dpdh-guided") !== "off");
  const [showWelcome, setShowWelcome] = useState(() => window.localStorage.getItem("dpdh-guided-seen") !== "yes");
  const [demoMode, setDemoMode] = useState<DemoMode>(() => (window.localStorage.getItem("dpdh-demo-mode") as DemoMode) || "standard");
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>(() => getWorkTasks());
  const connection = getConnectionReadiness();
  const runtime = getRuntimeConfig();
  const [improvements, setImprovements] = useState<PracticeImprovement[]>(() => getPracticeImprovements());
  const visibleNav = zoneModules[zone].filter((item) => roleModules[role].includes(item));
  const selectedEngagement = seed.engagements.find((engagement) => engagement.id === engagementId) ?? seed.engagements[0];
  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return nav
      .filter((item) => roleModules[role].includes(item))
      .filter((item) => `${item} ${descriptions[item]}`.toLowerCase().includes(query))
      .slice(0, 6);
  }, [role, search]);
  const labels = language === "Español"
    ? { settings: "Configuración de usuario", role: "Rol", language: "Idioma", close: "Cerrar", currentRole: "Vista de rol", all: "Mostrar todo", title: "Centro de entrega de protección de datos" }
    : { settings: "User settings", role: "Role", language: "Language", close: "Close", currentRole: "Role view", all: "Show all modules", title: "Data Protection Delivery Hub" };

  useEffect(() => { window.localStorage.setItem("dpdh-theme", theme); }, [theme]);
  useEffect(() => { window.localStorage.setItem("dpdh-role", role); }, [role]);
  useEffect(() => { window.localStorage.setItem("dpdh-language", language); }, [language]);
  useEffect(() => { window.localStorage.setItem("dpdh-guided", guided ? "on" : "off"); }, [guided]);
  useEffect(() => { window.localStorage.setItem("dpdh-demo-mode", demoMode); }, [demoMode]);
  useEffect(() => {
    const refreshTasks = () => setWorkTasks(getWorkTasks());
    window.addEventListener("dpdh-work-tasks-changed", refreshTasks);
    return () => window.removeEventListener("dpdh-work-tasks-changed", refreshTasks);
  }, []);

  function closeWelcome() {
    setShowWelcome(false);
    window.localStorage.setItem("dpdh-guided-seen", "yes");
  }

  function changeRole(nextRole: Role | "All modules") {
    if (nextRole === "All modules") {
      setRole("Platform Administrator");
      return;
    }
    setRole(nextRole);
    if (!roleModules[nextRole].includes(page)) {
      setZone("Start");
      setPage("Command Center");
    }
  }

  function openModule(nextPage: ModuleName) {
    const nextZone = zones.find((candidate) => zoneModules[candidate].includes(nextPage));
    if (nextZone) setZone(nextZone);
    setPage(nextPage);
    setSearch("");
  }

  function startWalkthrough() {
    setDemoMode("walkthrough");
    setWalkthroughStep(0);
    setSettingsOpen(false);
  }

  const metrics = useMemo(
    () => [
      { label: "Active engagements", value: seed.engagements.length, module: "Engagements" as ModuleName, detail: `${seed.engagements.length} engagement(s) are in flight: ${seed.engagements.map((engagement) => `${engagement.name} (${engagement.stage}, ${engagement.health})`).join("; ")}.` },
      { label: "Critical/high risks", value: seed.risks.length, module: "RAID & Decisions" as ModuleName, detail: `${seed.risks.length} tracked risk(s): ${seed.risks.map((risk) => `${risk.title} (${risk.severity}, owner ${risk.owner})`).join("; ")}.` },
      { label: "Open decisions", value: seed.decisions.length, module: "RAID & Decisions" as ModuleName, detail: `${seed.decisions.length} open decision(s): ${seed.decisions.map((decision) => `${decision.title} (${decision.status}, owner ${decision.owner})`).join("; ")}.` },
      { label: "Deliverables in flight", value: seed.deliverables.length, module: "Deliverables" as ModuleName, detail: `${seed.deliverables.length} deliverable(s) in review: ${seed.deliverables.map((item) => `${item.title} (${item.state})`).join("; ")}.` },
    ],
    [],
  );

  return (
    <div className={`app theme-${theme}`}>
      <aside className="side">
        <div className="brand">
          Data Protection
          <br />
          Delivery Hub
          <div className="tag">Govern delivery. Prove readiness. Scale expertise.</div>
        </div>

        <div className="side-actions">
        <button
          type="button"
          className="theme-toggle"
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
          {theme === "light" ? "Dark theme" : "Light theme"}
        </button>
        <button type="button" className="help-button" onClick={() => setHelpOpen(true)} title="Help, glossary, and role guide">Help</button>
        <button type="button" className="user-button" onClick={() => setSettingsOpen(true)}>
          <span className="avatar" aria-hidden="true">DM</span>
          <span><strong>Demo user</strong><small>{role}</small></span>
        </button>
        </div>

        <nav className="nav">
          <div className="nav-label">Experience</div>
          {zones.map((item) => (
            <button
              key={item}
              type="button"
              className={`zone-button ${zone === item ? "active" : ""}`}
              title={guided ? `Open the ${item} journey zone` : undefined}
              onClick={() => {
                const firstAvailable = zoneModules[item].find((module) => roleModules[role].includes(module));
                if (!firstAvailable) return; // no module in this zone is reachable for the active role; keep current view instead of stranding the sidebar
                setZone(item);
                setPage(firstAvailable);
              }}
            >
              {item}
            </button>
          ))}
          <div className="nav-label">Workspace</div>
          {visibleNav.map((item) => (
            <button
              key={item}
              type="button"
              className={page === item ? "active" : ""}
              aria-current={page === item ? "page" : undefined}
              onClick={() => openModule(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main" aria-label={labels.title}>
        <div className="context-bar">
          <span className={`runtime-badge ${runtimeMode === "live" ? "runtime-live" : "runtime-demo"}`}>
            {runtimeMode === "live" ? "Live mode" : "Demo mode"}
          </span>
          <label className="engagement-context">
            <span>Engagement</span>
            <select aria-label="Active engagement context" value={selectedEngagement?.id} onChange={(event) => setEngagementId(event.target.value)}>
              {seed.engagements.map((engagement) => <option key={engagement.id} value={engagement.id}>{engagement.name}</option>)}
            </select>
          </label>
          <div className="global-search">
            <label htmlFor="hub-search" className="sr-only">Search the Hub</label>
            <input id="hub-search" type="search" value={search} placeholder="Search modules and actions" title="Find a workspace by name or description" onChange={(event) => setSearch(event.target.value)} />
            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((result) => <button type="button" key={result} onClick={() => openModule(result)}><strong>{result}</strong><small>{descriptions[result]}</small></button>)}
              </div>
            )}
          </div>
          <span>{labels.currentRole}: <strong>{role}</strong></span>
          <button type="button" onClick={() => setSettingsOpen(true)}>Settings</button>
        </div>
        {runtimeMode === "live" && !runtime.canUseLiveData ? (
          <LiveModeGate onReturnToDemo={() => setRuntimeMode("demo")} />
        ) : page === "Command Center" ? (
          <>
            <div className="hero">
              <div>
                <div className="label accent">Practice delivery operating system <InfoTip text="The Hub connects work, evidence, decisions, readiness, and outcomes without replacing the tools teams already use." /></div>
                <h1>Command Center</h1>
                <div>Trace scope, ownership, decisions, risk, evidence, readiness, and outcomes.</div>
              </div>
              <div className="hero-meta">
                <strong>Demo mode</strong>
                <br />
                <small>{connection.mode === "local" ? "Synthetic + local browser persistence" : "Synthetic data only"}</small>
                <br />
                <small>{selectedEngagement?.stage} · {selectedEngagement?.health} health</small>
                <button className="hero-demo-button" type="button" onClick={startWalkthrough}>Start leadership walkthrough</button>
              </div>
            </div>

            <ValueProposition role={role} onOpenModule={openModule} />
            <PresentationBrief onStartWalkthrough={startWalkthrough} onOpenMyWork={() => openModule("My Work")} />
            <WorkflowOverview guided={guided} />
            <StageDocumentationPanel engagement={selectedEngagement} workTasks={workTasks} runtimeMode={runtimeMode} />
            <ProjectStatusReportPanel workTasks={workTasks} runtimeMode={runtimeMode} />
            <IntelligencePanel workTasks={workTasks} risks={seed.risks} decisions={seed.decisions} onSelect={(item) => setDetail(item)} onOpenModule={openModule} />

            <div className="grid-section-heading"><span className="label accent">Portfolio metrics</span><InfoTip text="These counts summarize active engagements, risk, decisions, and deliverables across the portfolio. Select any card to see the underlying records and open the workspace where they live." /></div>
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <button className="card interactive-card" type="button" key={metric.label} onClick={() => setDetail({ title: metric.label, summary: metric.detail, action: `Open ${metric.module}`, onAction: () => openModule(metric.module) })}>
                  <div className="label">{metric.label}</div>
                  <div className="metric">{metric.value}</div>
                </button>
              ))}
            </div>

            <div className="grid-section-heading"><span className="label accent">Readiness signals</span><InfoTip text="These signals show how close the work is to being release-ready: how much evidence is complete, how many deliverables are ready, and how many risks still need action. Select a card for the detail behind the number." /></div>
            <div className="signal-grid">
              {lifecycleSignals.map((signal) => (
                <button className="card signal-card interactive-card" type="button" key={signal.title} onClick={() => setDetail({ title: signal.title, summary: signal.detail, action: `Open ${signal.module}`, onAction: () => openModule(signal.module) })}>
                  <div className="label">{signal.title}</div>
                  <div className={`metric signal ${signal.tone}`}>{signal.value}</div>
                </button>
              ))}
            </div>

            <div className="card work-signal-card">
              <div className="records-heading">
                <div><div className="label accent">Signal to action</div><h2>My Work queue</h2><p className="muted">Risk and decision actions stay linked to an owned, editable task.</p></div>
                <button type="button" onClick={() => openModule("My Work")}>Open My Work</button>
              </div>
              <div className="work-signal-list">
                {workTasks.slice(0, 4).map((task) => (
                  <button type="button" className="list-item interactive-list-item" key={task.id} onClick={() => openModule("My Work")}>
                    <strong>{task.title}</strong><small>{task.status} · {task.owner} · due {task.dueDate}</small>
                  </button>
                ))}
                {workTasks.length === 0 && <p className="empty-state">No tasks yet. Use a risk or decision action to create one.</p>}
              </div>
            </div>

            <div className="card leadership-brief">
              <div className="records-heading">
                <div>
                  <div className="label accent">Leadership alignment</div>
                  <h2>What leadership should be able to see quickly</h2>
                  <p className="muted">The demo is organized around outcomes and decision support, not a catalogue of screens.</p>
                </div>
                <span className="record-count">Director briefing view</span>
              </div>
              <div className="leadership-grid">
                <div>
                  <strong>Practice impact</strong>
                  <p>Are delivery quality, consistency, reuse, and client outcomes improving?</p>
                </div>
                <div>
                  <strong>Evidence and control</strong>
                  <p>Can we prove readiness, ownership, traceability, and gate decisions?</p>
                </div>
                <div>
                  <strong>Scale and repeatability</strong>
                  <p>Which standards, playbooks, and lessons reduce dependence on individual experts?</p>
                </div>
                <div>
                  <strong>Attention required</strong>
                  <p>What is blocked, at risk, overdue, or waiting for a leadership decision?</p>
                </div>
              </div>
              <div className="alignment-footer">
                <span><strong>Direct lead:</strong> execution quality and clear ownership</span>
                <span><strong>Practice manager:</strong> repeatable operating cadence and adoption</span>
                <span><strong>Director:</strong> measurable practice impact and informed decisions</span>
              </div>
            </div>

            <PracticeImprovementPanel improvements={improvements} onAdded={(item) => setImprovements((current) => [...current, item])} onSelect={(item) => setDetail(item)} onOpenModule={openModule} />
            <QualityTrendPanel onSelect={(item) => setDetail(item)} onOpenModule={openModule} />
            <EvidenceChainPanel workTasks={workTasks} risks={seed.risks} decisions={seed.decisions} onSelect={(item) => setDetail(item)} onOpenModule={openModule} />

            <div className="section">
              <div className="card">
                <h2>Engagement portfolio</h2>
                <div className="row header-row">
                  <span>Engagement</span>
                  <span>Stage</span>
                  <span>Health</span>
                  <span>Progress</span>
                </div>

                {seed.engagements.map((engagement) => (
                  <button className="row interactive-row" type="button" key={engagement.id} onClick={() => setDetail({ title: engagement.name, summary: `${engagement.stage} stage with ${engagement.health} health and ${engagement.progress}% progress. Select this engagement in the context selector to review its related delivery modules.`, action: "Set active engagement", onAction: () => setEngagementId(engagement.id) })}>
                    <strong>{engagement.name}</strong>
                    <span>{engagement.stage}</span>
                    <Pill v={engagement.health} />
                    <div className="progress-wrap">
                      <div className="progress">
                        <span style={{ width: `${engagement.progress}%` }} />
                      </div>
                      <small>{engagement.progress}%</small>
                    </div>
                  </button>
                ))}
              </div>

              <div className="stack">
                <div className="card">
                  <h2>Priority risks</h2>
                  {seed.risks.map((risk) => (
                    <button type="button" key={risk.id} className="list-item interactive-list-item" onClick={() => setDetail({ title: risk.title, summary: `${risk.severity} priority risk owned by ${risk.owner}, due ${risk.due}. Create an owned mitigation task, then edit its outcome and evidence in My Work.`, resolution: resolutionFor(risk.title, risk.owner, risk.due, risk.severity), action: "Create/update My Work task", onAction: () => signalTaskAction({ id: risk.id, type: "Risk", title: `Mitigate risk: ${risk.title}`, owner: risk.owner, dueDate: risk.due, stage: "Assess", blocker: "Risk mitigation requires an owner decision.", expectedOutcome: `Mitigation plan for ${risk.title} is agreed and tracked.` }, () => openModule("My Work")) })}>
                      <Pill v={risk.severity} /> <strong>{risk.title}</strong>
                      <br />
                      <small>
                        {risk.owner} · {risk.due}
                      </small>
                    </button>
                  ))}
                </div>

                <div className="card">
                  <h2>Stage gate watchlist</h2>
                  {stageGates.map((gate) => (
                    <button className="gate-row interactive-row" type="button" key={gate.name} onClick={() => setDetail({ title: gate.name, summary: `${gate.status} gate owned by ${gate.owner}. Review mandatory criteria, evidence, unresolved risks, and authorized approval before advancing the engagement.`, resolution: resolutionFor(gate.name, gate.owner, "Before gate review", gate.status), action: "Open Readiness & Assurance", onAction: () => openModule("Readiness & Assurance") })}>
                      <div>
                        <strong>{gate.name}</strong>
                        <div className="mini-meta">{gate.owner}</div>
                      </div>
                      <Pill v={gate.status} />
                    </button>
                  ))}
                </div>

                <div className="card">
                  <h2>Decisions</h2>
                  {seed.decisions.map((decision) => (
                    <button type="button" key={decision.id} className="list-item interactive-list-item" onClick={() => setDetail({ title: decision.title, summary: `${decision.status} decision owned by ${decision.owner}. Create an accountable decision task, then edit its evidence and completion criteria in My Work.`, resolution: resolutionFor(decision.title, decision.owner, "To be scheduled", decision.status), action: "Create/update My Work task", onAction: () => signalTaskAction({ id: decision.id, type: "Decision", title: `Resolve decision: ${decision.title}`, owner: decision.owner, dueDate: "To be scheduled", stage: "Design", blocker: "Decision outcome is pending approval.", expectedOutcome: `Decision ${decision.title} is recorded with rationale and approver.` }, () => openModule("My Work")) })}>
                      <strong>{decision.title}</strong>
                      <br />
                      <small>
                        {decision.status} · {decision.owner}
                      </small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : page === "My Work" ? (
          <MyWork />
        ) : (
          <Module key={page} page={page} workTasks={workTasks} risks={seed.risks} decisions={seed.decisions} onSelect={setDetail} onOpenModule={openModule} />
        )}
      </main>
      {settingsOpen && (
        <div className="settings-backdrop" role="presentation" onClick={() => setSettingsOpen(false)}>
          <section className="settings-pane" role="dialog" aria-modal="true" aria-labelledby="settings-title" onClick={(event) => event.stopPropagation()}>
            <div className="settings-header">
              <div><div className="label">{labels.settings}</div><h2 id="settings-title">Demo user</h2></div>
              <button type="button" className="close-button" aria-label={labels.close} onClick={() => setSettingsOpen(false)}>×</button>
            </div>
            <label className="settings-field">
              {labels.language}
              <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
                <option>English</option>
                <option>Español</option>
              </select>
            </label>
            <label className="guided-toggle">
              <input type="checkbox" checked={guided} onChange={(event) => setGuided(event.target.checked)} />
              <span><strong>Guided mode</strong><small>Show onboarding cues and helpful explanations.</small></span>
            </label>
            <label className="settings-field">
              Demo experience
              <select value={demoMode} onChange={(event) => {
                const nextMode = event.target.value as DemoMode;
                setDemoMode(nextMode);
                if (nextMode === "walkthrough") startWalkthrough();
              }}>
                <option value="standard">Standard dashboard</option>
                <option value="walkthrough">Leadership walkthrough</option>
              </select>
              <small>Walkthrough mode explains the story and moves through the main views.</small>
            </label>
            <label className="settings-field">
              Environment mode
              <select value={runtimeMode} onChange={(event) => setRuntimeMode(event.target.value as RuntimeMode)}>
                <option value="demo">Demo — synthetic/local data</option>
                <option value="live">Live — approved adapter required</option>
              </select>
            </label>
            <label className="settings-field">
              {labels.role}
              <select value={role} onChange={(event) => changeRole(event.target.value as Role)}>
                {roleOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </label>
            <button type="button" className="all-modules-button" onClick={() => changeRole("All modules")}>{labels.all}</button>
            <p className="settings-note">Preferences are stored locally for this demonstration. Production role visibility will be enforced by Dataverse security roles and teams.</p>
          </section>
        </div>
      )}
      {showWelcome && guided && <GuidedWelcome onClose={closeWelcome} />}
      {demoMode === "walkthrough" && <DemoWalkthrough step={walkthroughStep} onNext={() => setWalkthroughStep((current) => current + 1)} onClose={() => setDemoMode("standard")} onNavigate={openModule} />}
      {helpOpen && <HelpGuide role={role} onOpenModule={openModule} onClose={() => setHelpOpen(false)} onStartWalkthrough={startWalkthrough} />}
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ValueProposition({ role, onOpenModule }: { role: Role; onOpenModule: (page: ModuleName) => void }) {
  const value = roleValue[role];
  return (
    <section className="value-proposition" aria-labelledby="value-proposition-title">
      <div className="value-main">
        <div className="label accent">Why this exists</div>
        <h2 id="value-proposition-title">{value.title}</h2>
        <p>{value.benefit}</p>
        <div className="value-actions">
          {value.actions.map((action) => (
            <button type="button" className="value-action" key={action.label} onClick={() => onOpenModule(action.module)}>
              {action.label}
            </button>
          ))}
        </div>
      </div>
      <div className="value-proof">
        <strong>One operating view instead of seven disconnected tools</strong>
        <p>Teams, SharePoint, Planner, Outlook, OneNote, Power BI, and PowerPoint remain useful sources. The Hub connects their delivery signals to ownership, evidence, stage decisions, and outcomes.</p>
        <small>Source of truth: governed delivery records · Evidence: authoritative links · Intelligence: explainable signals</small>
      </div>
    </section>
  );
}

function PresentationBrief({ onStartWalkthrough, onOpenMyWork }: { onStartWalkthrough: () => void; onOpenMyWork: () => void }) {
  return (
    <section className="presentation-brief" aria-labelledby="presentation-brief-title">
      <div className="presentation-brief-main">
        <div className="label accent">Supervisor briefing</div>
        <h2 id="presentation-brief-title">This is a delivery control plane, not another dashboard</h2>
        <p>
          The Hub connects the work people do across Teams, SharePoint, Planner, Outlook, OneNote, Power BI, and PowerPoint
          to the controls leadership needs: ownership, evidence, decisions, readiness, handoff, and measurable improvement.
        </p>
        <div className="presentation-actions">
          <button className="primary-button" type="button" onClick={onStartWalkthrough}>Run the leadership walkthrough</button>
          <button className="secondary-button" type="button" onClick={onOpenMyWork}>Show the execution view</button>
        </div>
      </div>
      <div className="presentation-brief-grid">
        <div>
          <strong>1. See the signal</strong>
          <span>A risk, evidence gap, decision, or readiness concern is visible before the status meeting.</span>
        </div>
        <div>
          <strong>2. Trace the source</strong>
          <span>Click the item to see its owner, timing, context, and the record that must be updated.</span>
        </div>
        <div>
          <strong>3. Move the work</strong>
          <span>Open the right workspace, assign the next action, attach evidence, and record the decision.</span>
        </div>
        <div>
          <strong>4. Protect the gate</strong>
          <span>Advance only when mandatory evidence, ownership, support, and approval criteria are satisfied.</span>
        </div>
      </div>
      <div className="presentation-boundary">
        <strong>What you are seeing today:</strong> a fully navigable synthetic-data demonstration with local browser persistence.
        <strong>What production adds:</strong> governed Dataverse and SharePoint adapters, Entra authorization, audit, ALM, monitoring, and support controls.
      </div>
    </section>
  );
}

function LiveModeGate({ onReturnToDemo }: { onReturnToDemo: () => void }) {
  return (
    <section className="card live-mode-gate" aria-labelledby="live-mode-title">
      <div className="label accent">Live environment boundary</div>
      <h1 id="live-mode-title">Live mode is not connected</h1>
      <p>No approved Dataverse/SharePoint adapter is configured for this build. The Hub has intentionally stopped before loading or writing data.</p>
      <div className="live-mode-checklist">
        <strong>Developer handoff</strong>
        <span>Implement the repository adapter, environment variables, Entra/Dataverse authorization, audit, approvals, monitoring, and release evidence before enabling live mode.</span>
      </div>
      <button className="primary-button" type="button" onClick={onReturnToDemo}>Return to Demo mode</button>
    </section>
  );
}

function WorkflowOverview({ guided }: { guided: boolean }) {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const selected = selectedStage === null ? null : lifecycleStages[selectedStage];
  const selectedTemplate = selected ? stageTemplates.find((template) => template.stage === selected.stage) : undefined;
  return (
    <section className="card workflow-overview" aria-labelledby="workflow-title">
      <div className="records-heading">
        <div>
          <div className="label accent">How work flows</div>
          <h2 id="workflow-title">Every engagement moves from commitment to proof to outcome</h2>
          <p className="muted">Each stage has an expected output, evidence, decision rights, and an exit condition. A gate protects the next stage from unresolved work.</p>
        </div>
        <span className="record-count">10 lifecycle stages</span>
      </div>
      <div className="lifecycle-strip">
        {lifecycleStages.map((item, index) => (
          <div className="lifecycle-step" key={item.stage}>
            <span className="lifecycle-number">{index + 1}</span>
            <strong>{item.stage} {guided && <button className={`lifecycle-help-button ${selectedStage === index ? "active" : ""}`} type="button" aria-label={`Explain ${item.stage} stage`} aria-expanded={selectedStage === index} onClick={() => setSelectedStage((current) => (current === index ? null : index))}>i</button>}</strong>
            <small>{item.output}</small>
          </div>
        ))}
      </div>
      {selected && (
        <div className="lifecycle-detail" role="status">
          <div className="records-heading">
            <div><span className="label accent">Selected stage</span><strong>{selected.stage}</strong></div>
            <button className="secondary-button" type="button" onClick={() => setSelectedStage(null)}>Close stage explanation</button>
          </div>
          {selectedTemplate ? (
            <div className="lifecycle-detail-grid">
              <div><span className="label">Purpose</span><p>{selectedTemplate.purpose}</p></div>
              <div><span className="label">Required inputs</span><ul className="bullet-list">{selectedTemplate.requiredInputs.map((input) => <li key={input}>{input}</li>)}</ul></div>
              <div><span className="label">Expected outputs</span><ul className="bullet-list">{selectedTemplate.expectedOutputs.map((output) => <li key={output}>{output}</li>)}</ul></div>
              <div><span className="label">Decision rights</span><p>{selectedTemplate.decisionRights}</p></div>
              <div><span className="label">Exit criteria</span><p>{selectedTemplate.exitCriteria}</p></div>
            </div>
          ) : (
            <div><span className="label">Expected output</span><span>{selected.output}</span></div>
          )}
        </div>
      )}
      <div className="workflow-footer">
        <span><strong>Readiness:</strong> evidence, tests, ownership, support, and mandatory criteria</span>
        <span><strong>Decision:</strong> authorized human approval with rationale and audit</span>
        <span><strong>Learning:</strong> validated lessons become sanitized reusable assets</span>
      </div>
    </section>
  );
}

type StageDocEngagement = {
  name: string;
  stage: string;
  health: string;
  owner: string;
  progress: number;
  readiness: number;
  evidence: number;
};

const defaultStageDocumentationSections = stageDocumentationSections.reduce((selection, section) => {
  selection[section.id] = true;
  return selection;
}, {} as StageDocumentationSectionSelection);

function StageDocumentationPanel({ engagement, workTasks, runtimeMode }: { engagement: StageDocEngagement | undefined; workTasks: WorkTask[]; runtimeMode: RuntimeMode }) {
  const stages = stageTemplates.map((template) => template.stage);
  const [stage, setStage] = useState(stages[0] ?? "");
  const [documentation, setDocumentation] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [selectedSections, setSelectedSections] = useState<StageDocumentationSectionSelection>(defaultStageDocumentationSections);
  const selectedSectionCount = stageDocumentationSections.filter((section) => selectedSections[section.id]).length;

  const toggleSection = (sectionId: StageDocumentationSectionId) => {
    setSelectedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
    setDocumentation(null);
  };

  const generate = () => {
    if (!engagement) return;
    const content = generateStageDocumentation({
      stage,
      engagementName: engagement.name,
      engagementStage: engagement.stage,
      engagementHealth: engagement.health,
      engagementOwner: engagement.owner,
      engagementProgress: engagement.progress,
      engagementReadiness: engagement.readiness,
      engagementEvidence: engagement.evidence,
      workTasks,
      stageGates,
      risks: seed.risks,
      decisions: seed.decisions,
      portfolio: seed.engagements.map((item) => ({
        name: item.name,
        stage: item.stage,
        health: item.health,
        progress: item.progress,
        readiness: item.readiness,
        evidence: item.evidence,
        selected: item.name === engagement.name,
      })),
      runtimeMode,
    }, selectedSections);
    setDocumentation(content);
    setCopyStatus("idle");
  };

  const copyToClipboard = async () => {
    if (!documentation) return;
    try {
      await navigator.clipboard.writeText(documentation);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  const fileBase = `${stage.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")}-stage-documentation`;

  return (
    <section className="card stage-documentation" aria-labelledby="stage-doc-title">
      <div className="records-heading">
        <div>
          <div className="label accent">Stage report builder</div>
          <h2 id="stage-doc-title">Build a filtered lifecycle-stage report</h2>
          <p className="muted">Assembled locally from the stage template, My Work tasks, stage gates, the selected engagement, and optional in-memory summaries. Demo mode only uses synthetic/local data.</p>
        </div>
        <span className="record-count">{selectedSectionCount} of {stageDocumentationSections.length} sections selected</span>
      </div>
      <div className="stage-doc-controls">
        <div className="toolbar">
          <label className="sr-only" htmlFor="stage-doc-select">Lifecycle stage</label>
          <select id="stage-doc-select" value={stage} onChange={(event) => { setStage(event.target.value); setDocumentation(null); }}>
            {stages.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="primary-button" type="button" onClick={generate} disabled={!engagement}>Generate report</button>
          {documentation && (
            <>
              <button className="secondary-button" type="button" onClick={copyToClipboard}>
                {copyStatus === "copied" ? "Copied! Paste into Teams/Outlook" : copyStatus === "failed" ? "Copy failed — select and copy manually" : "Copy to clipboard (Teams/Outlook)"}
              </button>
              <a className="secondary-button" href={buildMailtoLink(`${stage} stage report — ${engagement?.name ?? "engagement"}`, documentation)}>Email report</a>
              <button className="secondary-button" type="button" onClick={() => downloadTextFile(`${fileBase}.md`, documentation, "text/markdown")}>Download .md</button>
              <button className="secondary-button" type="button" onClick={() => downloadTextFile(`${fileBase}.txt`, documentation, "text/plain")}>Download .txt</button>
            </>
          )}
        </div>
        <fieldset className="stage-doc-section-picker">
          <legend>Choose sections to include</legend>
          <div className="stage-doc-section-list">
            {stageDocumentationSections.map((section) => (
              <label className="stage-doc-checkbox" key={section.id}>
                <input type="checkbox" checked={selectedSections[section.id]} onChange={() => toggleSection(section.id)} />
                <span>
                  <strong>{section.label}</strong>
                  {"optional" in section ? <small>Optional summary section</small> : <small>Core stage-documentation content</small>}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      {documentation ? (
        <pre className="stage-doc-output">{documentation}</pre>
      ) : (
        <p className="empty-state">Select a stage, choose the report sections to include, and then generate the output. The selected checkboxes control which content blocks actually appear in the report.</p>
      )}
    </section>
  );
}

function ProjectStatusReportPanel({ workTasks, runtimeMode }: { workTasks: WorkTask[]; runtimeMode: RuntimeMode }) {
  const [documentation, setDocumentation] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  const generate = () => {
    const content = generateProjectStatusReport({
      engagements: seed.engagements.map((item) => ({
        name: item.name,
        stage: item.stage,
        health: item.health,
        progress: item.progress,
        readiness: item.readiness,
        evidence: item.evidence,
      })),
      workTasks,
      stageGates,
      risks: seed.risks,
      decisions: seed.decisions,
      runtimeMode,
    });
    setDocumentation(content);
    setCopyStatus("idle");
  };

  const copyToClipboard = async () => {
    if (!documentation) return;
    try {
      await navigator.clipboard.writeText(documentation);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className="card stage-documentation" aria-labelledby="project-report-title">
      <div className="records-heading">
        <div>
          <div className="label accent">Project status report</div>
          <h2 id="project-report-title">Generate a full document on the whole project</h2>
          <p className="muted">Covers every engagement, quality metric, improvement action, stage gate, all ten lifecycle stages, My Work status, risks/decisions, and evidence chains in one document. Use this for a complete leadership hand-out; use the Stage Report Builder above when you only need one stage.</p>
        </div>
        <span className="record-count">Whole-project summary</span>
      </div>
      <div className="stage-doc-controls">
        <div className="toolbar">
          <button className="primary-button" type="button" onClick={generate}>Generate full project report</button>
          {documentation && (
            <>
              <button className="secondary-button" type="button" onClick={copyToClipboard}>
                {copyStatus === "copied" ? "Copied! Paste into Teams/Outlook" : copyStatus === "failed" ? "Copy failed — select and copy manually" : "Copy to clipboard (Teams/Outlook)"}
              </button>
              <a className="secondary-button" href={buildMailtoLink("Data Protection Delivery Hub — project status report", documentation)}>Email report</a>
              <button className="secondary-button" type="button" onClick={() => downloadTextFile("project-status-report.md", documentation, "text/markdown")}>Download .md</button>
              <button className="secondary-button" type="button" onClick={() => downloadTextFile("project-status-report.txt", documentation, "text/plain")}>Download .txt</button>
            </>
          )}
        </div>
      </div>
      {documentation ? (
        <pre className="stage-doc-output">{documentation}</pre>
      ) : (
        <p className="empty-state">Generate a single, comprehensive document covering the entire project's current status — no section picking required.</p>
      )}
    </section>
  );
}

function IntelligencePanel({
  workTasks,
  risks,
  decisions,
  onSelect,
  onOpenModule,
}: {
  workTasks: WorkTask[];
  risks: EvidenceChainRisk[];
  decisions: EvidenceChainDecision[];
  onSelect: (detail: DetailTarget) => void;
  onOpenModule: (page: ModuleName) => void;
}) {
  const designExceptionTask = workTasks.find((task) => task.id === "task-design-exception");
  const transitionTask = workTasks.find((task) => task.id === "task-transition-readiness");
  const ownershipRisk = risks.find((risk) => risk.id === "r1") ?? risks[0];
  const validateGate = stageGates.find((gate) => gate.name === "Validate & Assure");

  const signals: Array<{
    label: string;
    value: string;
    detail: string;
    tone: string;
    summary: string;
    resolution?: ResolutionPlan;
    action?: string;
    onAction?: () => void;
  }> = [
    {
      label: "Likely to fail",
      value: "Design exception",
      detail: "Approval overdue; compensating control missing",
      tone: "Red",
      summary: designExceptionTask
        ? `Linked to My Work: ${designExceptionTask.title} (${designExceptionTask.status}, owner ${designExceptionTask.owner}, due ${designExceptionTask.dueDate}). ${designExceptionTask.blocker}`
        : "This advisory signal should point to an owner, source record, and next action before the next status meeting.",
      resolution: designExceptionTask ? resolutionFor(designExceptionTask.title, designExceptionTask.owner, designExceptionTask.dueDate, "Blocked") : undefined,
      action: designExceptionTask ? "Open My Work" : undefined,
      onAction: designExceptionTask ? () => onOpenModule("My Work") : undefined,
    },
    {
      label: "Decision at risk",
      value: "Customer ownership",
      detail: "Confirmation date not recorded",
      tone: "Amber",
      summary: ownershipRisk
        ? `Linked to RAID risk: ${ownershipRisk.title} (${ownershipRisk.severity} priority, owner ${ownershipRisk.owner}, due ${ownershipRisk.due}). Create an owned mitigation task, then edit its outcome and evidence in My Work.`
        : "This advisory signal should point to an owner, source record, and next action before the next status meeting.",
      resolution: ownershipRisk ? resolutionFor(ownershipRisk.title, ownershipRisk.owner, ownershipRisk.due, ownershipRisk.severity) : undefined,
      action: ownershipRisk ? "Create/update My Work task" : undefined,
      onAction: ownershipRisk
        ? () =>
            signalTaskAction(
              { id: ownershipRisk.id, type: "Risk", title: `Mitigate risk: ${ownershipRisk.title}`, owner: ownershipRisk.owner, dueDate: ownershipRisk.due, stage: "Assess", blocker: "Risk mitigation requires an owner decision.", expectedOutcome: `Mitigation plan for ${ownershipRisk.title} is agreed and tracked.` },
              () => onOpenModule("My Work"),
            )
        : undefined,
    },
    {
      label: "Evidence gap",
      value: "Validate & Assure",
      detail: "12 items submitted; 5 still need review",
      tone: "Amber",
      summary: validateGate
        ? `Linked to stage gate: ${validateGate.name} (${validateGate.status}, owner ${validateGate.owner}). ${validateGate.note}. Review mandatory criteria and evidence in Readiness & Assurance.`
        : "This advisory signal should point to an owner, source record, and next action before the next status meeting.",
      resolution: validateGate ? resolutionFor(validateGate.name, validateGate.owner, "Before gate review", validateGate.status) : undefined,
      action: validateGate ? "Open Readiness & Assurance" : undefined,
      onAction: validateGate ? () => onOpenModule("Readiness & Assurance") : undefined,
    },
    {
      label: "Standard opportunity",
      value: "Transition checklist",
      detail: "Adoption correlates with cleaner handoffs",
      tone: "Green",
      summary: transitionTask
        ? `Linked to My Work: ${transitionTask.title} (${transitionTask.status}, owner ${transitionTask.owner}, due ${transitionTask.dueDate}). Adoption of this checklist correlates with cleaner handoffs across engagements.`
        : "This advisory signal should point to an owner, source record, and next action before the next status meeting.",
      resolution: transitionTask ? resolutionFor(transitionTask.title, transitionTask.owner, transitionTask.dueDate, transitionTask.status) : undefined,
      action: transitionTask ? "Open My Work" : undefined,
      onAction: transitionTask ? () => onOpenModule("My Work") : undefined,
    },
  ];
  return (
    <section className="card intelligence-panel" aria-labelledby="intelligence-title">
      <div className="records-heading">
        <div>
          <div className="label accent">System of intelligence</div>
          <h2 id="intelligence-title">What needs attention before the next status meeting?</h2>
          <p className="muted">Signals are explainable: each insight points to a source record, owner, and next action. AI may assist; accountable humans decide.</p>
        </div>
        <span className="record-count">Advisory signals</span>
      </div>
      <div className="intelligence-grid">
        {signals.map((signal) => (
          <button
            type="button"
            className="intelligence-item interactive-card"
            key={signal.label}
            onClick={() => onSelect({ title: signal.value, summary: signal.summary, resolution: signal.resolution, action: signal.action, onAction: signal.onAction })}
          >
            <Pill v={signal.tone} />
            <div>
              <span className="label">{signal.label}</span>
              <strong>{signal.value}</strong>
              <small>{signal.detail}</small>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function QualityTrendPanel({ onSelect, onOpenModule }: { onSelect: (detail: DetailTarget) => void; onOpenModule: (page: ModuleName) => void }) {
  return (
    <div className="card quality-trends">
      <div className="records-heading">
        <div><h2>Quality trend</h2><p className="muted">Synthetic history shows the measurement pattern to preserve when production data is connected.</p></div>
        <span className="record-count">5 periods</span>
      </div>
      <div className="trend-grid">
        {qualityMetrics.map((metric) => {
          const values = metricHistory[metric.id] ?? [];
          const max = Math.max(...values, 1);
          return <button type="button" className="trend-card interactive-card" key={metric.id} onClick={() => onSelect({ title: metric.name, summary: `Synthetic trend history: baseline ${metric.baseline}${metric.unit === "%" ? "%" : ""}, target ${metric.target}${metric.unit === "%" ? "%" : ""}. In production this metric should be sourced from governed records and reviewed by the practice owner.`, action: "Open Practice Intelligence", onAction: () => onOpenModule("Practice Intelligence") })}>
            <strong>{metric.name}</strong>
            <div className="trend-bars" aria-label={`${metric.name} trend`}>
              {values.map((value, index) => <span key={`${metric.id}-${index}`} style={{ height: `${Math.max(8, (value / max) * 100)}%` }} title={`${value}${metric.unit === "%" ? "%" : ""}`} />)}
            </div>
            <small>Baseline {metric.baseline}{metric.unit === "%" ? "%" : ""} · Target {metric.target}{metric.unit === "%" ? "%" : ""}</small>
          </button>;
        })}
      </div>
    </div>
  );
}

function EvidenceChainPanel({
  workTasks,
  risks,
  decisions,
  onSelect,
  onOpenModule,
}: {
  workTasks: WorkTask[];
  risks: EvidenceChainRisk[];
  decisions: EvidenceChainDecision[];
  onSelect: (detail: DetailTarget) => void;
  onOpenModule: (page: ModuleName) => void;
}) {
  const [filter, setFilter] = useState<"all" | "attention">("all");
  const chains = useMemo(() => getEvidenceChains(workTasks, stageGates, risks, decisions), [workTasks, risks, decisions]);
  const visibleChains = filter === "attention" ? chains.filter((chain) => chain.overallStatus !== "Green") : chains;
  const attentionCount = chains.filter((chain) => chain.overallStatus !== "Green").length;

  function openNode(chain: EvidenceChain, node: EvidenceChainNode) {
    const needsAttention = node.status !== "Green";
    let action: string | undefined;
    let onAction: (() => void) | undefined;

    if (node.kind === "requirement") {
      action = "Review stage documentation";
      onAction = () => onOpenModule("Command Center");
    } else if (node.kind === "gate") {
      action = "Open Readiness & Assurance";
      onAction = () => onOpenModule("Readiness & Assurance");
    } else if ((node.kind === "evidence" || node.kind === "review") && needsAttention) {
      action = "Open My Work";
      onAction = () => onOpenModule("My Work");
    } else if (node.kind === "link" && needsAttention) {
      if (chain.sourceType === "Risk") {
        const risk = risks.find((item) => item.id === chain.sourceId);
        action = "Create/update My Work task";
        onAction = () => {
          if (risk) {
            signalTaskAction({ id: risk.id, type: "Risk", title: `Mitigate risk: ${risk.title}`, owner: risk.owner, dueDate: risk.due, stage: "Assess", blocker: "Risk mitigation requires an owner decision.", expectedOutcome: `Mitigation plan for ${risk.title} is agreed and tracked.` }, () => onOpenModule("My Work"));
          } else {
            onOpenModule("My Work");
          }
        };
      } else if (chain.sourceType === "Decision") {
        const decision = decisions.find((item) => item.id === chain.sourceId);
        action = "Create/update My Work task";
        onAction = () => {
          if (decision) {
            signalTaskAction({ id: decision.id, type: "Decision", title: `Resolve decision: ${decision.title}`, owner: decision.owner, dueDate: "To be scheduled", stage: "Design", blocker: "Decision outcome is pending approval.", expectedOutcome: `Decision ${decision.title} is recorded with rationale and approver.` }, () => onOpenModule("My Work"));
          } else {
            onOpenModule("My Work");
          }
        };
      } else {
        action = "Open My Work";
        onAction = () => onOpenModule("My Work");
      }
    }

    onSelect({
      title: `${chain.title} → ${node.label}`,
      summary: node.detail,
      resolution: needsAttention ? resolutionFor(node.label, chain.owner, "See linked record for the due date", node.status) : undefined,
      action,
      onAction,
    });
  }

  return (
    <section className="card evidence-chain-panel" aria-labelledby="evidence-chain-title">
      <div className="records-heading">
        <div>
          <div className="label accent">Evidence chain</div>
          <h2 id="evidence-chain-title">Trace requirement, evidence, review, and readiness impact</h2>
          <p className="muted">Click any node for its detail and next action. Chains are assembled locally from My Work, RAID &amp; Decisions, and stage gate data — no live connector is used.</p>
        </div>
        <span className="record-count">{attentionCount} of {chains.length} need attention</span>
      </div>
      <div className="toolbar">
        <label className="view-control">
          <span className="sr-only">Evidence chain view</span>
          <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | "attention")}>
            <option value="all">All chains</option>
            <option value="attention">Needs attention</option>
          </select>
        </label>
      </div>
      <div className="evidence-chain-list">
        {visibleChains.map((chain) => (
          <div className={`evidence-chain-row${chain.overallStatus !== "Green" ? " attention" : ""}`} key={chain.id}>
            <div className="evidence-chain-row-header">
              <div>
                <strong>{chain.title}</strong>
                <small>{chain.stage} · {chain.owner} · {chain.sourceType}</small>
              </div>
              <Pill v={chain.overallStatus} />
            </div>
            <div className="evidence-chain-nodes">
              {chain.nodes.flatMap((node, index) => {
                const button = (
                  <button type="button" key={`${chain.id}-${node.kind}`} className={`evidence-chain-node ${node.status}`} onClick={() => openNode(chain, node)}>
                    <span className="evidence-chain-node-kind">{evidenceChainNodeLabels[node.kind]}</span>
                    <span className="evidence-chain-node-label">{node.label}</span>
                  </button>
                );
                if (index === chain.nodes.length - 1) return [button];
                return [button, <span className="evidence-chain-arrow" aria-hidden="true" key={`${chain.id}-${node.kind}-arrow`}>→</span>];
              })}
            </div>
          </div>
        ))}
        {visibleChains.length === 0 && <p className="empty-state">No chains match this view — every tracked chain is Green.</p>}
      </div>
    </section>
  );
}

function MyWork() {
  const [tasks, setTasks] = useState<WorkTask[]>(() => getWorkTasks());
  const [stage, setStage] = useState("All stages");
  const [status, setStatus] = useState("All statuses");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WorkTask | null>(null);
  const [formError, setFormError] = useState("");
  const stages = ["All stages", ...Array.from(new Set(tasks.map((task) => task.stage)))];
  const statuses = ["All statuses", "Not started", "In progress", "Blocked", "Ready for review", "Complete"];
  const visibleTasks = tasks.filter((task) => (stage === "All stages" || task.stage === stage) && (status === "All statuses" || task.status === status));
  const blockedCount = tasks.filter((task) => task.status === "Blocked").length;
  const reviewCount = tasks.filter((task) => task.status === "Ready for review").length;

  function changeStatus(id: string, nextStatus: WorkTaskStatus) {
    const updated = updateWorkTaskStatus(id, nextStatus);
    if (updated) setTasks((current) => current.map((task) => task.id === id ? updated : task));
  }

  function startEditing(task: WorkTask) {
    setEditingId(task.id);
    setDraft({ ...task });
    setFormError("");
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const requiredFields = [draft.title, draft.owner, draft.dueDate, draft.expectedOutcome, draft.evidence, draft.evidenceLink, draft.evidenceStatus, draft.decisionApproval, draft.blocker, draft.definitionOfDone];
    if (requiredFields.some((value) => !value.trim())) {
      setFormError("Complete every core delivery field before saving. Use “Not applicable” when a decision or approval does not apply.");
      return;
    }
    const updated = updateWorkTask(draft.id, {
      title: draft.title.trim(),
      expectedOutcome: draft.expectedOutcome.trim(),
      evidence: draft.evidence.trim(),
      evidenceLink: draft.evidenceLink.trim(),
      evidenceStatus: draft.evidenceStatus,
      decisionApproval: draft.decisionApproval.trim(),
      owner: draft.owner.trim(),
      dueDate: draft.dueDate.trim(),
      blocker: draft.blocker.trim() || "None",
      definitionOfDone: draft.definitionOfDone.trim(),
    });
    if (updated) setTasks((current) => current.map((task) => task.id === updated.id ? updated : task));
    setEditingId(null);
    setDraft(null);
  }

  return (
    <>
      <div className="hero module-hero">
        <div>
          <div className="label accent">Lifecycle execution</div>
          <h1>My Work</h1>
          <div>Prioritize assigned work by stage, outcome, evidence, ownership, and definition of done.</div>
        </div>
        <div className="hero-meta">
          <strong>{tasks.length} active tasks</strong>
          <br />
          <small>{blockedCount} blocked · {reviewCount} ready for review</small>
        </div>
      </div>

      <div className="my-work-principles">
        <div><strong>Owner + due date</strong><span>Every action has accountable ownership and a deadline.</span></div>
        <div><strong>Outcome + evidence</strong><span>Required proof includes a link and review status.</span></div>
        <div><strong>Decision / approval</strong><span>Record the approver or explicitly mark not applicable.</span></div>
        <div><strong>Blocker + done</strong><span>Escalation and closure criteria are explicit.</span></div>
      </div>

      <div className="toolbar">
        <label className="view-control">
          <span className="sr-only">Filter by lifecycle stage</span>
          <select value={stage} onChange={(event) => setStage(event.target.value)}>{stages.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <label className="view-control">
          <span className="sr-only">Filter by task status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
        </label>
        <span className="record-count">{visibleTasks.length} visible tasks</span>
      </div>

      <div className="work-task-list">
        {visibleTasks.map((task) => (
          <article className={`card work-task ${task.status === "Blocked" ? "work-task-blocked" : ""}`} key={task.id}>
            <div className="work-task-header">
              <div>
                <span className="stage-chip">{task.stage}</span>
                <h2>{task.title}</h2>
              </div>
              <label className="task-status">
                <span className="sr-only">Task status</span>
                <select value={task.status} onChange={(event) => changeStatus(task.id, event.target.value as WorkTaskStatus)}>
                  {statuses.slice(1).map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              {editingId !== task.id && <button type="button" onClick={() => startEditing(task)}>Edit task</button>}
            </div>
            {editingId === task.id && draft ? (
              <form className="task-edit-form" onSubmit={saveTask}>
                <p className="required-fields-note">Required: owner, due date, expected outcome, evidence required/link/status, decision or approval, blocker/escalation, and definition of done.</p>
                {formError && <p className="form-error" role="alert">{formError}</p>}
                <label>Task title<input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></label>
                <div className="work-task-grid">
                  <label><span className="label">Expected outcome</span><textarea required value={draft.expectedOutcome} onChange={(event) => setDraft({ ...draft, expectedOutcome: event.target.value })} /></label>
                  <label><span className="label">Evidence required</span><textarea required value={draft.evidence} onChange={(event) => setDraft({ ...draft, evidence: event.target.value })} /></label>
                  <label><span className="label">Evidence link</span><input required value={draft.evidenceLink} onChange={(event) => setDraft({ ...draft, evidenceLink: event.target.value })} /><span className="label">Evidence status</span><select required value={draft.evidenceStatus} onChange={(event) => setDraft({ ...draft, evidenceStatus: event.target.value as WorkTask["evidenceStatus"] })}><option>Not started</option><option>In progress</option><option>Submitted</option><option>Accepted</option><option>Rejected</option></select></label>
                  <label><span className="label">Owner</span><input required value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value })} /><span className="label">Due date</span><input required value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
                  <label><span className="label">Definition of done</span><textarea required value={draft.definitionOfDone} onChange={(event) => setDraft({ ...draft, definitionOfDone: event.target.value })} /></label>
                </div>
                <label><span className="label">Decision / approval</span><input required value={draft.decisionApproval} onChange={(event) => setDraft({ ...draft, decisionApproval: event.target.value })} /></label>
                <label><span className="label">Blocker / escalation</span><textarea required value={draft.blocker} onChange={(event) => setDraft({ ...draft, blocker: event.target.value })} /></label>
                <div className="detail-actions"><button type="button" className="secondary-button" onClick={() => { setEditingId(null); setDraft(null); }}>Cancel</button><button type="submit" className="primary-button">Save task</button></div>
              </form>
            ) : (
              <>
                <div className="work-task-grid">
                  <div><span className="label">Expected outcome</span><p>{task.expectedOutcome}</p></div>
                  <div><span className="label">Evidence required / link / status</span><p>{task.evidence}<br /><strong>{task.evidenceLink}</strong><br /><Pill v={task.evidenceStatus} /></p></div>
                  <div><span className="label">Owner and due date</span><p>{task.owner}<br /><strong>{task.dueDate}</strong></p></div>
                  <div><span className="label">Decision / approval</span><p>{task.decisionApproval}</p></div>
                  <div><span className="label">Definition of done</span><p>{task.definitionOfDone}</p></div>
                </div>
                <div className={`task-blocker ${task.blocker === "None" ? "no-blocker" : ""}`}>
                  <strong>{task.blocker === "None" ? "No blocker" : "Blocker / escalation"}</strong>
                  <span>{task.blocker}</span>
                </div>
              </>
            )}
          </article>
        ))}
        {visibleTasks.length === 0 && <div className="card empty-state">No tasks match the selected filters.</div>}
      </div>
    </>
  );
}

function Module({
  page,
  workTasks,
  risks,
  decisions,
  onSelect,
  onOpenModule,
}: {
  page: ModuleName;
  workTasks: WorkTask[];
  risks: EvidenceChainRisk[];
  decisions: EvidenceChainDecision[];
  onSelect: (detail: DetailTarget) => void;
  onOpenModule: (page: ModuleName) => void;
}) {
  const detail = moduleDetailMap[page];
  const [filter, setFilter] = useState("");
  const [view, setView] = useState<"all" | "review">("all");
  const [records, setRecords] = useState<HubRecord[]>(() => getRecords(page, detail.records));
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const filteredRecords = records.filter((record) => {
    const matchesView = view === "all" || record.status === "Amber";
    const matchesFilter = `${record.title} ${record.value}`.toLowerCase().includes(filter.toLowerCase());
    return matchesView && matchesFilter;
  });

  function openRecordDetail(record: HubRecord) {
    const needsAttention = record.status !== "Green";
    onSelect({
      title: record.title,
      summary: `${record.status} record owned by ${record.owner} in ${page}. Current value ${record.value}, last reviewed ${record.lastReviewed}.`,
      resolution: recordResolution(record, page),
      action: needsAttention ? "Create/update My Work task" : undefined,
      onAction: needsAttention
        ? () => signalTaskAction(
            {
              id: record.id,
              type: "Risk",
              title: `Resolve: ${record.title}`,
              owner: record.owner,
              dueDate: "To be scheduled",
              stage: page,
              blocker: `${record.title} is ${record.status} in ${page} and needs review.`,
              expectedOutcome: `${record.title} is reviewed, evidence is accepted, and status returns to Green.`,
            },
            () => onOpenModule("My Work"),
          )
        : undefined,
    });
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim() || !newValue.trim()) return;
    const record = addRecord(page, {
      title: newTitle.trim(),
      value: newValue.trim(),
      owner: "Demo user",
      status: "Amber",
    });
    setRecords((current) => [...current, record]);
    setNewTitle("");
    setNewValue("");
    setShowForm(false);
  }

  return (
    <>
      <div className="hero module-hero">
        <div>
          <div className="label accent">Delivery module</div>
          <h1>{page}</h1>
          <div>{descriptions[page]}</div>
        </div>
      </div>

      <div className="toolbar">
        <button type="button" onClick={() => setShowForm((current) => !current)}>
          {showForm ? "Cancel" : "New record"}
        </button>
        <label className="view-control">
          <span className="sr-only">Saved view</span>
          <select value={view} onChange={(event) => setView(event.target.value as "all" | "review")}>
            <option value="all">All records</option>
            <option value="review">Needs review</option>
          </select>
        </label>
        <label className="filter-control">
          <span className="sr-only">Filter records</span>
          <input
            type="search"
            value={filter}
            placeholder="Filter records"
            onChange={(event) => setFilter(event.target.value)}
          />
        </label>
        <button type="button" onClick={() => downloadCsv(page, filteredRecords)}>
          Export
        </button>
      </div>

      {showForm && (
        <form className="card record-form" onSubmit={saveRecord}>
          <h2>Add local record</h2>
          <p className="muted">Saved in this browser only; no live connector is used.</p>
          <div className="form-grid">
            <label>
              Record title
              <input required value={newTitle} onChange={(event) => setNewTitle(event.target.value)} />
            </label>
            <label>
              Current value
              <input required value={newValue} onChange={(event) => setNewValue(event.target.value)} />
            </label>
          </div>
          <button className="primary-button" type="submit">Save local record</button>
        </form>
      )}

      <div className="module-grid">
        <div className="card">
          <h2>{page}</h2>
          <p>{detail.summary}</p>
          <ul className="bullet-list">
            {detail.controls.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="card">
          <h2>Suggested actions</h2>
          <ul className="bullet-list">
            {detail.actions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {page === "Readiness & Assurance" && <StageGatePanel />}
      {page === "Administration" && <AdministrationPanel />}

      <div className="mini-grid">
        {detail.records.map((record) => (
          <div className="card mini-card" key={record.title}>
            <div className="label">{record.title}</div>
            <div className="metric compact">{record.value}</div>
          </div>
        ))}
      </div>

      <div className="card records-card">
        <div className="records-heading">
          <div>
            <h2>Active records</h2>
            <p className="muted">Normalized view backed by the approved Dataverse record pattern. Click a row for details and resolution steps.</p>
          </div>
          <span className="record-count">{filteredRecords.length} visible records</span>
        </div>
        <div className="record-table-wrap">
          <table className="record-table">
            <thead>
              <tr>
                <th scope="col">Record</th>
                <th scope="col">Current value</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
                <th scope="col">Last reviewed</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={`${record.title}-row`}
                  className="clickable-row"
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${record.title}`}
                  onClick={() => openRecordDetail(record)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openRecordDetail(record);
                    }
                  }}
                >
                  <th scope="row">{record.title}</th>
                  <td>{record.value}</td>
                  <td>{record.owner}</td>
                  <td><Pill v={record.status} /></td>
                  <td>{record.lastReviewed}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <p className="empty-state">No records match “{filter}”.</p>
          )}
        </div>
      </div>

      {page === "Testing & Evidence" && (
        <EvidenceChainPanel workTasks={workTasks} risks={risks} decisions={decisions} onSelect={onSelect} onOpenModule={onOpenModule} />
      )}
    </>
  );
}

function StageGatePanel() {
  const mandatoryFailures = readinessCriteria.filter(
    (criterion) => criterion.mandatory && criterion.status !== "Green",
  );
  const recommendation = mandatoryFailures.length > 0 ? "No-go" : "Go with conditions";

  return (
    <div className="card stage-gate-card">
      <div className="records-heading">
        <div>
          <h2>Stage-gate evaluation</h2>
          <p className="muted">Mandatory criteria block a Green recommendation until reviewed and resolved.</p>
        </div>
        <div className="recommendation">
          <span className="label">Release recommendation</span>
          <strong className={recommendation === "No-go" ? "recommendation-red" : "recommendation-amber"}>
            {recommendation}
          </strong>
        </div>
      </div>
      {mandatoryFailures.length > 0 && (
        <div className="gate-alert" role="alert">
          <strong>Gate blocked:</strong> {mandatoryFailures.length} mandatory criterion requires review before approval.
        </div>
      )}
      <div className="criteria-list">
        {readinessCriteria.map((criterion) => (
          <div className="criterion-row" key={criterion.name}>
            <div>
              <strong>{criterion.name}</strong>
              <div className="mini-meta">
                {criterion.owner} · {criterion.mandatory ? "Mandatory" : "Advisory"}
              </div>
            </div>
            <Pill v={criterion.status} />
          </div>
        ))}
      </div>
      <p className="ai-note">AI and automation may identify gaps, but only an authorized human can approve this gate.</p>
    </div>
  );
}

function AdministrationPanel() {
  const connection = getConnectionReadiness();
  const auditEvents = getAuditEvents();

  return (
    <div className="admin-panels">
      <div className="card connection-card">
        <div className="records-heading">
          <div>
            <h2>Connection readiness</h2>
            <p className="muted">{connection.message}</p>
          </div>
          <Pill v={connection.ready ? "Green" : "Amber"} />
        </div>
        <div className="connection-grid">
          <div><span className="label">Current mode</span><strong>{connection.mode}</strong></div>
          <div><span className="label">Solution</span><strong>{repositoryConfig.solutionName}</strong></div>
          <div><span className="label">Publisher prefix</span><strong>{repositoryConfig.publisherPrefix}</strong></div>
        </div>
        {!connection.ready && (
          <div className="connection-alert">
            <strong>Pending target configuration:</strong> {connection.missing.join(", ")}.
          </div>
        )}
      </div>

      <div className="card">
        <h2>Reference catalogs</h2>
        <p className="muted">Configuration records replace hard-coded environment and identity values.</p>
        <div className="admin-table-wrap">
          <table className="record-table">
            <thead>
              <tr>
                <th scope="col">Catalog</th>
                <th scope="col">Configured entries</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {adminCatalogs.map((catalog) => (
                <tr key={catalog.name}>
                  <th scope="row">{catalog.name}</th>
                  <td>{catalog.entries}</td>
                  <td>{catalog.owner}</td>
                  <td><Pill v={catalog.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Role mapping</h2>
        <p className="muted">Least-privilege scope and approval boundaries from the security model.</p>
        <div className="admin-table-wrap">
          <table className="record-table">
            <thead>
              <tr>
                <th scope="col">Role</th>
                <th scope="col">Scope</th>
                <th scope="col">Approval boundary</th>
              </tr>
            </thead>
            <tbody>
              {roleMappings.map((mapping) => (
                <tr key={mapping.role}>
                  <th scope="row">{mapping.role}</th>
                  <td>{mapping.scope}</td>
                  <td>{mapping.approvals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Stage templates and definitions of done</h2>
        <p className="muted">Configurable lifecycle expectations for inputs, outputs, decision rights, and exit criteria.</p>
        <div className="admin-table-wrap">
          <table className="record-table">
            <thead><tr><th scope="col">Stage</th><th scope="col">Expected outputs</th><th scope="col">Decision rights</th><th scope="col">Exit criteria</th></tr></thead>
            <tbody>{stageTemplates.map((template) => <tr key={template.stage}><th scope="row">{template.stage}</th><td>{template.expectedOutputs.join(", ")}</td><td>{template.decisionRights}</td><td>{template.exitCriteria}</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Knowledge reuse governance</h2>
        <p className="muted">Assets require sanitization and review before practice publication; client-confidential content stays out of reuse.</p>
        <div className="admin-table-wrap">
          <table className="record-table">
            <thead><tr><th scope="col">Asset</th><th scope="col">Type</th><th scope="col">Sanitization</th><th scope="col">Review state</th><th scope="col">Adoption</th></tr></thead>
            <tbody>{reusableAssets.map((asset) => <tr key={asset.id}><th scope="row">{asset.title}</th><td>{asset.type}</td><td>{asset.sanitization}</td><td>{asset.reviewState}</td><td>{asset.adoptionCount} engagements</td></tr>)}</tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Audit trail</h2>
        <p className="muted">Local demonstration events show the production requirement for meaningful change history.</p>
        {auditEvents.length === 0 ? <p className="empty-state">No local audit events yet. Change a My Work task status to create one.</p> : auditEvents.slice(0, 5).map((event) => <div className="audit-row" key={event.id}><strong>{event.action}</strong><span>{event.rationale}</span><small>{event.actor} · {new Date(event.occurredOn).toLocaleString()}</small></div>)}
      </div>
    </div>
  );
}

export default App;
