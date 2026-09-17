import { useEffect, useMemo, useState, type FormEvent } from "react";
import seed from "./data/seed.json";
import { addPracticeImprovement, addRecord, getAuditEvents, getConnectionReadiness, getPracticeImprovements, getRecords, getRuntimeConfig, getWorkTasks, metricHistory, qualityMetrics, repositoryConfig, reusableAssets, stageTemplates, updateWorkTaskStatus, type HubRecord, type PracticeImprovement, type RuntimeMode, type WorkTask, type WorkTaskStatus } from "./data/repository";
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
type DetailTarget = { title: string; summary: string; action?: string; onAction?: () => void };

const zoneModules: Record<Zone, ModuleName[]> = {
  Start: ["Command Center", "My Work"],
  Deliver: ["Pipeline & Intake", "Engagements", "Discovery & Assessment", "Scope & Requirements", "Delivery Execution", "RAID & Decisions"],
  Prove: ["Architecture & Controls", "Testing & Evidence", "Readiness & Assurance"],
  Transition: ["Deliverables", "Transition & Operations"],
  Improve: ["Knowledge & Reuse", "Practice Intelligence", "Administration"],
};

const zones = Object.keys(zoneModules) as Zone[];

const roleModules: Record<Role, ModuleName[]> = {
  Consultant: ["Command Center", "My Work", "Engagements", "Discovery & Assessment", "Testing & Evidence", "Knowledge & Reuse"],
  "Workstream Lead": ["Command Center", "My Work", "Engagements", "Scope & Requirements", "Architecture & Controls", "Delivery Execution", "Testing & Evidence"],
  Architect: ["Command Center", "My Work", "Engagements", "Architecture & Controls", "RAID & Decisions", "Readiness & Assurance", "Knowledge & Reuse"],
  "Project Manager": ["Command Center", "My Work", "Pipeline & Intake", "Engagements", "Scope & Requirements", "Delivery Execution", "RAID & Decisions", "Deliverables"],
  "Engagement Manager": ["Command Center", "My Work", "Pipeline & Intake", "Engagements", "RAID & Decisions", "Readiness & Assurance", "Deliverables", "Transition & Operations"],
  Reviewer: ["Command Center", "My Work", "Testing & Evidence", "Readiness & Assurance", "Deliverables", "Knowledge & Reuse"],
  "Practice Leader": ["Command Center", "Engagements", "Knowledge & Reuse", "Practice Intelligence"],
  "Platform Administrator": [...nav],
};

const roleOptions = Object.keys(roleModules) as Role[];

const roleValue = {
  Consultant: { title: "Move delivery forward faster", benefit: "Capture evidence once, reduce status reporting, and see exactly what done means.", actions: ["Complete next assigned task", "Attach or request evidence", "Escalate a blocker"] },
  "Engagement Manager": { title: "Know whether the engagement is safe to advance", benefit: "See scope drift, risks, readiness, decisions, and handoff confidence in one review.", actions: ["Review gate blockers", "Resolve overdue decisions", "Confirm readiness"] },
  "Practice Leader": { title: "Scale what works across engagements", benefit: "Identify recurring failure patterns, adoption of standards, and where coaching creates leverage.", actions: ["Review quality trends", "Prioritize improvement actions", "Publish reusable assets"] },
  "Project Manager": { title: "Keep delivery controlled and predictable", benefit: "Coordinate milestones, dependencies, changes, deliverables, and ownership without rebuilding reports.", actions: ["Review milestone health", "Manage scope changes", "Prepare status narrative"] },
  Architect: { title: "Make decisions traceable and reusable", benefit: "Connect architecture choices to controls, exceptions, tests, evidence, and downstream impact.", actions: ["Resolve design decisions", "Review control mappings", "Coach decision quality"] },
  "Workstream Lead": { title: "Turn work into reviewable outcomes", benefit: "Organize requirements, configuration, tests, evidence, and defects around a clear definition of done.", actions: ["Close traceability gaps", "Route evidence for review", "Re-sequence blocked work"] },
  Reviewer: { title: "Review the proof, not the story", benefit: "Focus on evidence quality, deliverable review states, and the criteria that determine readiness.", actions: ["Review evidence queue", "Disposition defects", "Approve or return deliverables"] },
  "Platform Administrator": { title: "Keep the operating model governed", benefit: "Manage reference data, roles, stage criteria, integrations, audit, and support readiness.", actions: ["Review configuration", "Validate security boundaries", "Monitor automation health"] },
} satisfies Record<Role, { title: string; benefit: string; actions: string[] }>;

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
  { title: "Evidence completeness", value: "76%", tone: "Green" },
  { title: "Ready for release", value: "3 of 7", tone: "Amber" },
  { title: "Actionable risks", value: "11", tone: "Red" },
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
        <div className="detail-actions">
          <button className="secondary-button" type="button" onClick={onClose}>Close</button>
          {detail.action && detail.onAction && <button className="primary-button" type="button" onClick={() => { detail.onAction?.(); onClose(); }}>{detail.action}</button>}
        </div>
      </section>
    </div>
  );
}

function InfoTip({ text }: { text: string }) {
  return <span className="info-tip" tabIndex={0} aria-label={text}>i<span role="tooltip">{text}</span></span>;
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

function PracticeImprovementPanel({ improvements, onAdded }: { improvements: PracticeImprovement[]; onAdded: (item: PracticeImprovement) => void }) {
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
          <div className="practice-metric" key={metric.id}>
            <span className="label">{metric.name}</span>
            <strong className={`practice-value ${metric.actual >= metric.target === (metric.direction === "up") ? "Green" : "Amber"}`}>
              {metric.actual}{metric.unit === "%" ? "%" : ""}
            </strong>
            <small>{metric.period} · target {metric.target}{metric.unit === "%" ? "%" : ""}</small>
          </div>
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
          <div className="practice-action" key={action.id}>
            <div>
              <strong>{action.title}</strong>
              <p>{action.problem}</p>
              <small>{action.owner} · baseline {action.baseline} · target {action.target}</small>
            </div>
            <Pill v={action.status === "Complete" ? "Green" : action.status === "Planned" ? "Red" : "Amber"} />
          </div>
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

function App() {
  const [page, setPage] = useState<ModuleName>("Command Center");
  const [zone, setZone] = useState<Zone>("Start");
  const [engagementId, setEngagementId] = useState(seed.engagements[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => (window.localStorage.getItem("dpdh-theme") as "light" | "dark") || "light");
  const [role, setRole] = useState<Role>(() => (window.localStorage.getItem("dpdh-role") as Role) || "Engagement Manager");
  const [language, setLanguage] = useState<Language>(() => (window.localStorage.getItem("dpdh-language") as Language) || "English");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [runtimeMode, setRuntimeMode] = useState<RuntimeMode>(repositoryConfig.runtimeMode);
  const [guided, setGuided] = useState(() => window.localStorage.getItem("dpdh-guided") !== "off");
  const [showWelcome, setShowWelcome] = useState(() => window.localStorage.getItem("dpdh-guided-seen") !== "yes");
  const [demoMode, setDemoMode] = useState<DemoMode>(() => (window.localStorage.getItem("dpdh-demo-mode") as DemoMode) || "standard");
  const [walkthroughStep, setWalkthroughStep] = useState(0);
  const [detail, setDetail] = useState<DetailTarget | null>(null);
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
      { label: "Active engagements", value: seed.engagements.length },
      { label: "Critical/high risks", value: seed.risks.length },
      { label: "Open decisions", value: seed.decisions.length },
      { label: "Deliverables in flight", value: seed.deliverables.length },
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
                setZone(item);
                const firstAvailable = zoneModules[item].find((module) => roleModules[role].includes(module));
                if (firstAvailable) setPage(firstAvailable);
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

            <ValueProposition role={role} />
            <WorkflowOverview guided={guided} />
            <IntelligencePanel onSelect={(item) => setDetail(item)} />

            <div className="metrics-grid">
              {metrics.map((metric) => (
                <button className="card interactive-card" type="button" key={metric.label} onClick={() => setDetail({ title: metric.label, summary: `This demo currently shows ${metric.value} ${metric.label.toLowerCase()}. In Live mode this card will be backed by governed Dataverse records and permission-filtered reporting.` })}>
                  <div className="label">{metric.label}</div>
                  <div className="metric">{metric.value}</div>
                </button>
              ))}
            </div>

            <div className="signal-grid">
              {lifecycleSignals.map((signal) => (
                <button className="card signal-card interactive-card" type="button" key={signal.title} onClick={() => setDetail({ title: signal.title, summary: `Current demo signal: ${signal.value}. Use the linked work, evidence, and decision records to understand the source and next action behind this signal.` })}>
                  <div className="label">{signal.title}</div>
                  <div className={`metric signal ${signal.tone}`}>{signal.value}</div>
                </button>
              ))}
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

            <PracticeImprovementPanel improvements={improvements} onAdded={(item) => setImprovements((current) => [...current, item])} />
            <QualityTrendPanel onSelect={(item) => setDetail(item)} />

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
                    <button type="button" key={risk.id} className="list-item interactive-list-item" onClick={() => setDetail({ title: risk.title, summary: `${risk.severity} priority risk owned by ${risk.owner}, due ${risk.due}. Open RAID & Decisions to record mitigation, dependencies, decisions, and escalation.` , action: "Open RAID & Decisions", onAction: () => openModule("RAID & Decisions") })}>
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
                    <button className="gate-row interactive-row" type="button" key={gate.name} onClick={() => setDetail({ title: gate.name, summary: `${gate.status} gate owned by ${gate.owner}. Review mandatory criteria, evidence, unresolved risks, and authorized approval before advancing the engagement.`, action: "Open Readiness & Assurance", onAction: () => openModule("Readiness & Assurance") })}>
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
                    <button type="button" key={decision.id} className="list-item interactive-list-item" onClick={() => setDetail({ title: decision.title, summary: `${decision.status} decision owned by ${decision.owner}. Capture rationale, approver, due date, evidence, and any exception expiry in RAID & Decisions.`, action: "Open RAID & Decisions", onAction: () => openModule("RAID & Decisions") })}>
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
          <Module page={page} />
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
      {detail && <DetailModal detail={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function ValueProposition({ role }: { role: Role }) {
  const value = roleValue[role];
  return (
    <section className="value-proposition" aria-labelledby="value-proposition-title">
      <div className="value-main">
        <div className="label accent">Why this exists</div>
        <h2 id="value-proposition-title">{value.title}</h2>
        <p>{value.benefit}</p>
        <div className="value-actions">
          {value.actions.map((action) => <span key={action}>{action}</span>)}
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
            <strong>{item.stage} {guided && <button className="lifecycle-help-button" type="button" aria-label={`Explain ${item.stage} stage`} title={`Expected output: ${item.output}`} onClick={() => setSelectedStage(index)}>i</button>}</strong>
            <small>{item.output}</small>
          </div>
        ))}
      </div>
      {selected && (
        <div className="lifecycle-detail" role="status">
          <div><span className="label accent">Selected stage</span><strong>{selected.stage}</strong></div>
          <div><span className="label">Expected output</span><span>{selected.output}</span></div>
          <button className="secondary-button" type="button" onClick={() => setSelectedStage(null)}>Close stage explanation</button>
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

function IntelligencePanel({ onSelect }: { onSelect: (detail: DetailTarget) => void }) {
  const signals = [
    { label: "Likely to fail", value: "Design exception", detail: "Approval overdue; compensating control missing", tone: "Red" },
    { label: "Decision at risk", value: "Customer ownership", detail: "Confirmation date not recorded", tone: "Amber" },
    { label: "Evidence gap", value: "Validate & Assure", detail: "12 items submitted; 5 still need review", tone: "Amber" },
    { label: "Standard opportunity", value: "Transition checklist", detail: "Adoption correlates with cleaner handoffs", tone: "Green" },
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
        {signals.map((signal) => <button type="button" className="intelligence-item interactive-card" key={signal.label} onClick={() => onSelect({ title: signal.value, summary: `${signal.detail} This advisory signal should point to an owner, source record, and next action before the next status meeting.` })}><Pill v={signal.tone} /><div><span className="label">{signal.label}</span><strong>{signal.value}</strong><small>{signal.detail}</small></div></button>)}
      </div>
    </section>
  );
}

function QualityTrendPanel({ onSelect }: { onSelect: (detail: DetailTarget) => void }) {
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
          return <button type="button" className="trend-card interactive-card" key={metric.id} onClick={() => onSelect({ title: metric.name, summary: `Synthetic trend history: baseline ${metric.baseline}${metric.unit === "%" ? "%" : ""}, target ${metric.target}${metric.unit === "%" ? "%" : ""}. In production this metric should be sourced from governed records and reviewed by the practice owner.` })}>
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

function MyWork() {
  const [tasks, setTasks] = useState<WorkTask[]>(() => getWorkTasks());
  const [stage, setStage] = useState("All stages");
  const [status, setStatus] = useState("All statuses");
  const stages = ["All stages", ...Array.from(new Set(tasks.map((task) => task.stage)))];
  const statuses = ["All statuses", "Not started", "In progress", "Blocked", "Ready for review", "Complete"];
  const visibleTasks = tasks.filter((task) => (stage === "All stages" || task.stage === stage) && (status === "All statuses" || task.status === status));
  const blockedCount = tasks.filter((task) => task.status === "Blocked").length;
  const reviewCount = tasks.filter((task) => task.status === "Ready for review").length;

  function changeStatus(id: string, nextStatus: WorkTaskStatus) {
    const updated = updateWorkTaskStatus(id, nextStatus);
    if (updated) setTasks((current) => current.map((task) => task.id === id ? updated : task));
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
        <div><strong>Expected outcome</strong><span>What this task must produce</span></div>
        <div><strong>Evidence</strong><span>How completion will be proven</span></div>
        <div><strong>Definition of done</strong><span>What must be true before closure</span></div>
        <div><strong>Decision rights</strong><span>Who reviews, approves, or escalates</span></div>
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
            </div>
            <div className="work-task-grid">
              <div><span className="label">Expected outcome</span><p>{task.expectedOutcome}</p></div>
              <div><span className="label">Evidence required</span><p>{task.evidence}</p></div>
              <div><span className="label">Owner and due date</span><p>{task.owner}<br /><strong>{task.dueDate}</strong></p></div>
              <div><span className="label">Definition of done</span><p>{task.definitionOfDone}</p></div>
            </div>
            <div className={`task-blocker ${task.blocker === "None" ? "no-blocker" : ""}`}>
              <strong>{task.blocker === "None" ? "No blocker" : "Blocker / escalation"}</strong>
              <span>{task.blocker}</span>
            </div>
          </article>
        ))}
        {visibleTasks.length === 0 && <div className="card empty-state">No tasks match the selected filters.</div>}
      </div>
    </>
  );
}

function Module({ page }: { page: ModuleName }) {
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
            <p className="muted">Normalized view backed by the approved Dataverse record pattern.</p>
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
              {filteredRecords.map((record, index) => (
                <tr key={`${record.title}-row`}>
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

      <div className="card trace-card">
        <h2>Evidence chain</h2>
        <div className="trace-row">
          <span>Scope item</span>
          <span>Requirement</span>
          <span>Control</span>
          <span>Test case</span>
          <span>Evidence</span>
          <span>Readiness</span>
        </div>
      </div>
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
