export type RecordStatus = "Green" | "Amber" | "Red";

export type HubRecord = {
  id: string;
  title: string;
  value: string;
  owner: string;
  status: RecordStatus;
  lastReviewed: string;
  source: "synthetic" | "local";
};

export type RepositoryMode = "synthetic" | "local" | "dataverse";
export type RuntimeMode = "demo" | "live";

export type RepositoryConfig = {
  mode: RepositoryMode;
  runtimeMode: RuntimeMode;
  liveAdapterConfigured: boolean;
  dataverseUrl: string;
  solutionName: string;
  publisherPrefix: string;
  sharePointSiteUrl: string;
  sharePointEvidenceLibrary: string;
};

export type ImprovementStatus = "Planned" | "In progress" | "Ready to publish" | "Complete";

export type PracticeImprovement = {
  id: string;
  title: string;
  problem: string;
  owner: string;
  status: ImprovementStatus;
  baseline: string;
  target: string;
  impact: string;
  reviewDate: string;
  source: "synthetic" | "local";
};

export type QualityMetric = {
  id: string;
  name: string;
  period: string;
  cohort: string;
  baseline: number;
  target: number;
  actual: number;
  unit: "%" | "index";
  direction: "up" | "down";
};

export type WorkTaskStatus = "Not started" | "In progress" | "Blocked" | "Ready for review" | "Complete";

export type WorkTask = {
  id: string;
  title: string;
  stage: string;
  expectedOutcome: string;
  evidence: string;
  evidenceLink: string;
  evidenceStatus: "Not started" | "In progress" | "Submitted" | "Accepted" | "Rejected";
  decisionApproval: string;
  owner: string;
  dueDate: string;
  status: WorkTaskStatus;
  blocker: string;
  definitionOfDone: string;
  source: "synthetic" | "local";
  linkedRecordId?: string;
  linkedRecordType?: "Risk" | "Decision";
};

export type AuditEvent = {
  id: string;
  action: string;
  recordType: string;
  recordId: string;
  actor: string;
  rationale: string;
  occurredOn: string;
  source: "synthetic" | "local";
};

export type StageTemplate = {
  stage: string;
  purpose: string;
  requiredInputs: string[];
  expectedOutputs: string[];
  decisionRights: string;
  exitCriteria: string;
};

export type StageGateSummary = {
  name: string;
  status: string;
  owner: string;
  note: string;
};

export type StageDocumentationContext = {
  stage: string;
  engagementName: string;
  engagementStage: string;
  engagementHealth: string;
  engagementOwner: string;
  engagementProgress: number;
  engagementReadiness: number;
  engagementEvidence: number;
  workTasks: WorkTask[];
  stageGates: StageGateSummary[];
  risks?: EvidenceChainRisk[];
  decisions?: EvidenceChainDecision[];
  portfolio?: StageDocumentationPortfolioItem[];
  runtimeMode: RuntimeMode;
  generatedAt?: Date;
};

export const stageDocumentationSections = [
  { id: "purpose", label: "Purpose" },
  { id: "requiredInputs", label: "Required inputs" },
  { id: "expectedOutputs", label: "Expected outputs" },
  { id: "decisionRights", label: "Decision rights" },
  { id: "exitCriteria", label: "Exit criteria" },
  { id: "knownGaps", label: "Known gaps" },
  { id: "evidenceToGather", label: "Evidence to gather" },
  { id: "ownersAndDueDates", label: "Owners and due dates" },
  { id: "nextActions", label: "Next actions" },
  { id: "linkedRisksDecisions", label: "Linked risks and decisions", optional: true },
  { id: "evidenceChainSummary", label: "Evidence chain summary", optional: true },
  { id: "engagementPortfolioSnapshot", label: "Engagement portfolio snapshot", optional: true },
] as const satisfies ReadonlyArray<{ id: string; label: string; optional?: boolean }>;

export type StageDocumentationSectionId = (typeof stageDocumentationSections)[number]["id"];
export type StageDocumentationSectionSelection = Record<StageDocumentationSectionId, boolean>;

export type StageDocumentationPortfolioItem = {
  name: string;
  stage: string;
  health: string;
  progress: number;
  readiness: number;
  evidence: number;
  selected?: boolean;
};

export type ReusableAsset = {
  id: string;
  title: string;
  type: "Playbook" | "Template" | "Lesson learned";
  sanitization: "Required" | "Confirmed";
  reviewState: "Draft" | "Under review" | "Published";
  adoptionCount: number;
  owner: string;
  source: "synthetic" | "local";
};

const appEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const repositoryConfig: RepositoryConfig = {
  mode: appEnv?.VITE_HUB_MODE === "live" ? "dataverse" : "local",
  runtimeMode: appEnv?.VITE_HUB_MODE === "live" ? "live" : "demo",
  liveAdapterConfigured: appEnv?.VITE_LIVE_ADAPTER_CONFIGURED === "true",
  dataverseUrl: appEnv?.VITE_DATAVERSE_URL ?? "",
  solutionName: "DataProtectionDeliveryHub",
  publisherPrefix: appEnv?.VITE_PUBLISHER_PREFIX ?? "dpdh",
  sharePointSiteUrl: appEnv?.VITE_SHAREPOINT_SITE_URL ?? "",
  sharePointEvidenceLibrary: appEnv?.VITE_SHAREPOINT_EVIDENCE_LIBRARY ?? "",
};

const storageKey = "dpdh-local-records-v1";
const improvementStorageKey = "dpdh-practice-improvements-v1";
const workTaskStorageKey = "dpdh-work-tasks-v1";
const auditStorageKey = "dpdh-audit-events-v1";

const seedRecords: Record<string, HubRecord[]> = {
  "My Work": [
    { id: "my-work-1", title: "Assigned to me", value: "12", owner: "Engagement Manager", status: "Green", lastReviewed: "15 Sep 2026", source: "synthetic" },
    { id: "my-work-2", title: "Awaiting review", value: "5", owner: "Workstream Lead", status: "Amber", lastReviewed: "15 Sep 2026", source: "synthetic" },
    { id: "my-work-3", title: "Milestones due", value: "4", owner: "Reviewer", status: "Green", lastReviewed: "15 Sep 2026", source: "synthetic" },
  ],
};

const defaultImprovements: PracticeImprovement[] = [
  {
    id: "improvement-evidence-review",
    title: "Standardize evidence review",
    problem: "Three engagements repeated the same evidence-quality gap.",
    owner: "Quality Lead",
    status: "In progress",
    baseline: "42% accepted first pass",
    target: "75% accepted first pass",
    impact: "Reduce validation rework",
    reviewDate: "30 Sep 2026",
    source: "synthetic",
  },
  {
    id: "improvement-transition-checklist",
    title: "Publish transition checklist",
    problem: "Handoff quality varies by workstream and operator readiness is inconsistent.",
    owner: "Operations Lead",
    status: "Ready to publish",
    baseline: "5 of 9 handoffs complete",
    target: "100% checklist adoption",
    impact: "Improve operational acceptance",
    reviewDate: "07 Oct 2026",
    source: "synthetic",
  },
  {
    id: "improvement-architecture-decisions",
    title: "Coach architecture decision quality",
    problem: "Design-stage decisions are the largest source of downstream rework.",
    owner: "Practice Leader",
    status: "Planned",
    baseline: "19% recurring blocker rate",
    target: "10% recurring blocker rate",
    impact: "Reduce downstream change demand",
    reviewDate: "15 Oct 2026",
    source: "synthetic",
  },
];

const defaultWorkTasks: WorkTask[] = [
  {
    id: "task-discovery-evidence",
    title: "Close discovery evidence requests",
    stage: "Discover",
    expectedOutcome: "All required source evidence is received and mapped to discovery questions.",
    evidence: "Evidence register links and review outcomes",
    evidenceLink: "Evidence register pending customer links",
    evidenceStatus: "In progress",
    decisionApproval: "Workstream Lead review",
    owner: "Workstream Lead",
    dueDate: "18 Sep 2026",
    status: "In progress",
    blocker: "Two evidence items need customer confirmation.",
    definitionOfDone: "Every request has an owner, authoritative reference, sensitivity, and reviewer disposition.",
    source: "synthetic",
  },
  {
    id: "task-design-exception",
    title: "Resolve design exception approval",
    stage: "Design",
    expectedOutcome: "The selected design is approved with a documented compensating control.",
    evidence: "Architecture decision and exception record",
    evidenceLink: "Decision log and exception record pending approval",
    evidenceStatus: "In progress",
    decisionApproval: "Authorized approver — pending",
    owner: "Architect",
    dueDate: "20 Sep 2026",
    status: "Blocked",
    blocker: "Approver decision is overdue.",
    definitionOfDone: "Decision rationale, approver, expiry, and compensating control are recorded.",
    source: "synthetic",
  },
  {
    id: "task-transition-readiness",
    title: "Complete transition readiness checklist",
    stage: "Transition",
    expectedOutcome: "Named operators can accept the handoff and support model.",
    evidence: "Runbook, training record, support route, and acceptance confirmation",
    evidenceLink: "Transition readiness folder",
    evidenceStatus: "Submitted",
    decisionApproval: "Engagement Manager acceptance",
    owner: "Engagement Manager",
    dueDate: "25 Sep 2026",
    status: "Ready for review",
    blocker: "None",
    definitionOfDone: "Primary and backup owners confirm readiness and all mandatory criteria are green.",
    source: "synthetic",
  },
];

export const qualityMetrics: QualityMetric[] = [
  { id: "quality-index", name: "Delivery quality index", period: "Q3 2026", cohort: "All offerings", baseline: 75, target: 85, actual: 82, unit: "index", direction: "up" },
  { id: "gate-escape", name: "Stage-gate escape rate", period: "Q3 2026", cohort: "All offerings", baseline: 12, target: 5, actual: 8, unit: "%", direction: "down" },
  { id: "asset-adoption", name: "Reusable asset adoption", period: "Q3 2026", cohort: "All offerings", baseline: 52, target: 70, actual: 64, unit: "%", direction: "up" },
  { id: "blocker-rate", name: "Recurring blocker rate", period: "Q3 2026", cohort: "Design and build", baseline: 24, target: 10, actual: 19, unit: "%", direction: "down" },
];

export const metricHistory: Record<string, number[]> = {
  "quality-index": [71, 74, 77, 79, 82],
  "gate-escape": [15, 14, 12, 10, 8],
  "asset-adoption": [41, 46, 51, 58, 64],
  "blocker-rate": [29, 27, 25, 22, 19],
};

export const stageTemplates: StageTemplate[] = [
  { stage: "Qualify", purpose: "Confirm the opportunity is a fit for the offering and delivery capacity before it is accepted into active pipeline.", requiredInputs: ["Opportunity brief", "Offering fit checklist", "Delivery capacity check"], expectedOutputs: ["Accepted opportunity", "Named pursuit owner", "Preliminary risk flags"], decisionRights: "Pipeline owner qualifies; Practice Leader confirms capacity", exitCriteria: "Opportunity accepted with an owner and no unresolved capacity conflicts" },
  { stage: "Initiate", purpose: "Stand up the engagement with an approved charter, staffed team, and agreed governance before delivery work begins.", requiredInputs: ["Signed statement of work", "Staffing plan", "Governance model"], expectedOutputs: ["Approved charter", "Staffed team", "Kickoff record"], decisionRights: "Engagement Manager approves charter; Practice Leader confirms staffing", exitCriteria: "Charter signed, team staffed, and kickoff completed" },
  { stage: "Discover", purpose: "Build an evidence-backed understanding of the current state so scope and risk are grounded in fact, not assumption.", requiredInputs: ["Approved charter", "Workshop plan", "Evidence request register"], expectedOutputs: ["Current-state findings", "Validated questions", "Initial risks"], decisionRights: "Workstream Lead prepares; Engagement Manager confirms scope", exitCriteria: "Findings reviewed and evidence gaps owned" },
  { stage: "Assess", purpose: "Translate findings into prioritized, evidence-based recommendations the customer can act on with confidence.", requiredInputs: ["Current-state findings", "Maturity model", "Risk register"], expectedOutputs: ["Prioritized recommendations", "Gap analysis", "Proposed roadmap"], decisionRights: "Architect/Workstream Lead recommend; Engagement Manager confirms priorities", exitCriteria: "Recommendations reviewed and prioritization agreed with the customer" },
  { stage: "Design", purpose: "Turn approved requirements into an architecture and control set that is fit for purpose, reviewed, and formally approved.", requiredInputs: ["Approved requirements", "Architecture options", "Control mappings"], expectedOutputs: ["Approved design", "Decision log", "Exception records"], decisionRights: "Architect approves design; authorized approver accepts exceptions", exitCriteria: "Mandatory design criteria green and decisions recorded" },
  { stage: "Build", purpose: "Implement and configure the approved design in a controlled, reviewable, and reversible way.", requiredInputs: ["Approved design", "Build/configuration standards", "Environment access"], expectedOutputs: ["Validated configuration", "Build evidence", "Peer review sign-off"], decisionRights: "Workstream Lead executes; Architect reviews conformance to design", exitCriteria: "Configuration matches approved design and passes peer review" },
  { stage: "Validate", purpose: "Prove the design and configuration work as intended with reviewed evidence before recommending a go/no-go.", requiredInputs: ["Test plan", "Configured controls", "Evidence register"], expectedOutputs: ["Test results", "Defect disposition", "Readiness recommendation"], decisionRights: "Reviewer validates evidence; Engagement Manager recommends gate outcome", exitCriteria: "Mandatory tests passed and evidence accepted" },
  { stage: "Transition", purpose: "Hand off a supportable solution to named operators with the runbooks, training, and support model they need to accept it.", requiredInputs: ["Runbooks", "Support model", "Training plan"], expectedOutputs: ["Handoff acceptance", "Named operators", "Hypercare plan"], decisionRights: "Engagement Manager confirms acceptance with customer owner", exitCriteria: "Primary and backup operators confirm readiness" },
  { stage: "Close", purpose: "Formally confirm outcomes were delivered, obligations are met, and the engagement can be closed out.", requiredInputs: ["Outcome acceptance criteria", "Financial reconciliation", "Open item register"], expectedOutputs: ["Accepted outcomes", "Closure record", "Final invoice/reconciliation"], decisionRights: "Engagement Manager confirms closure; customer sponsor accepts outcomes", exitCriteria: "Outcomes accepted and no open items remain unassigned" },
  { stage: "Operate", purpose: "Confirm the delivered capability is producing the intended benefit and capture lessons for reuse.", requiredInputs: ["Hypercare results", "Benefit measures", "Lessons-learned input"], expectedOutputs: ["Benefits and lessons", "Sanitized reusable assets", "Post-engagement review"], decisionRights: "Practice Leader confirms lesson quality before reuse publication", exitCriteria: "Benefits reviewed and lessons sanitized for the practice" },
];

export const reusableAssets: ReusableAsset[] = [
  { id: "asset-evidence-review", title: "Evidence review checklist", type: "Template", sanitization: "Confirmed", reviewState: "Published", adoptionCount: 6, owner: "Quality Lead", source: "synthetic" },
  { id: "asset-transition", title: "Transition readiness playbook", type: "Playbook", sanitization: "Required", reviewState: "Under review", adoptionCount: 3, owner: "Operations Lead", source: "synthetic" },
  { id: "asset-decision-coaching", title: "Architecture decision coaching guide", type: "Lesson learned", sanitization: "Required", reviewState: "Draft", adoptionCount: 0, owner: "Practice Leader", source: "synthetic" },
];

function readLocalRecords(): Record<string, HubRecord[]> {
  if (typeof window === "undefined") return {};
  const stored = window.localStorage.getItem(storageKey);
  if (!stored) return {};
  try {
    return JSON.parse(stored) as Record<string, HubRecord[]>;
  } catch {
    return {};
  }
}

function writeLocalRecords(records: Record<string, HubRecord[]>) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey, JSON.stringify(records));
  }
}

function readImprovements(): PracticeImprovement[] {
  if (typeof window === "undefined") return defaultImprovements;
  const stored = window.localStorage.getItem(improvementStorageKey);
  if (!stored) return defaultImprovements;
  try {
    return JSON.parse(stored) as PracticeImprovement[];
  } catch {
    return defaultImprovements;
  }
}

function readWorkTasks(): WorkTask[] {
  const normalize = (tasks: WorkTask[]) => tasks.map((task) => ({
    ...task,
    evidenceLink: task.evidenceLink || "Evidence link to be added",
    evidenceStatus: task.evidenceStatus || "Not started",
    decisionApproval: task.decisionApproval || "Not applicable",
  }));
  if (typeof window === "undefined") return defaultWorkTasks;
  const stored = window.localStorage.getItem(workTaskStorageKey);
  if (!stored) return defaultWorkTasks;
  try {
    return normalize(JSON.parse(stored) as WorkTask[]);
  } catch {
    return defaultWorkTasks;
  }
}

function writeWorkTasks(tasks: WorkTask[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(workTaskStorageKey, JSON.stringify(tasks));
    window.dispatchEvent(new CustomEvent("dpdh-work-tasks-changed"));
  }
}

function readAuditEvents(): AuditEvent[] {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(auditStorageKey);
  if (!stored) return [];
  try { return JSON.parse(stored) as AuditEvent[]; } catch { return []; }
}

function writeAuditEvent(event: AuditEvent) {
  if (typeof window !== "undefined") window.localStorage.setItem(auditStorageKey, JSON.stringify([event, ...readAuditEvents()].slice(0, 100)));
}

export function getWorkTasks() {
  return readWorkTasks();
}

export function updateWorkTaskStatus(id: string, status: WorkTaskStatus) {
  const next = readWorkTasks().map((task) => task.id === id ? { ...task, status, source: "local" as const } : task);
  writeWorkTasks(next);
  const updated = next.find((task) => task.id === id);
  if (updated) writeAuditEvent({ id: `audit-${Date.now()}`, action: "Task status changed", recordType: "WorkTask", recordId: id, actor: "Demo user", rationale: `Status changed to ${status}`, occurredOn: new Date().toISOString(), source: "local" });
  return updated;
}

export function updateWorkTask(id: string, changes: Partial<Omit<WorkTask, "id" | "source">>) {
  const next = readWorkTasks().map((task) => task.id === id ? { ...task, ...changes, source: "local" as const } : task);
  writeWorkTasks(next);
  const updated = next.find((task) => task.id === id);
  if (updated) writeAuditEvent({ id: `audit-${Date.now()}`, action: "Work task updated", recordType: "WorkTask", recordId: id, actor: "Demo user", rationale: "Task details edited in My Work", occurredOn: new Date().toISOString(), source: "local" });
  return updated;
}

export function upsertWorkTaskFromSignal(input: {
  recordId: string;
  recordType: "Risk" | "Decision";
  title: string;
  owner: string;
  dueDate: string;
  stage: string;
  blocker: string;
  expectedOutcome: string;
}) {
  const tasks = readWorkTasks();
  const existing = tasks.find((task) => task.linkedRecordId === input.recordId);
  const task: WorkTask = existing
    ? { ...existing, ...input, source: "local" }
    : {
      id: `task-${input.recordType.toLowerCase()}-${input.recordId}-${Date.now()}`,
      ...input,
      evidence: `${input.recordType} mitigation or decision record`,
      evidenceLink: `${input.recordType} record link to be added`,
      evidenceStatus: "Not started",
      decisionApproval: input.recordType === "Decision" ? "Approver confirmation required" : "Not applicable",
      status: "Not started",
      definitionOfDone: "Owner records the outcome, supporting evidence, and any follow-up decision.",
      source: "local",
      linkedRecordId: input.recordId,
      linkedRecordType: input.recordType,
    };
  writeWorkTasks(existing ? tasks.map((item) => item.id === existing.id ? task : item) : [...tasks, task]);
  writeAuditEvent({ id: `audit-${Date.now()}`, action: existing ? "Signal task updated" : "Signal task created", recordType: input.recordType, recordId: input.recordId, actor: "Demo user", rationale: `${input.recordType} action linked to My Work`, occurredOn: new Date().toISOString(), source: "local" });
  return task;
}

export function getAuditEvents() {
  return readAuditEvents();
}

export function getPracticeImprovements() {
  return readImprovements();
}

export function addPracticeImprovement(input: Pick<PracticeImprovement, "title" | "problem" | "owner" | "baseline" | "target" | "impact">) {
  const next: PracticeImprovement = {
    ...input,
    id: `improvement-${Date.now()}`,
    status: "Planned",
    reviewDate: "To be scheduled",
    source: "local",
  };
  const improvements = [...readImprovements(), next];
  if (typeof window !== "undefined") window.localStorage.setItem(improvementStorageKey, JSON.stringify(improvements));
  return next;
}

export function getRecords(moduleName: string, fallback: Array<Pick<HubRecord, "title" | "value">>): HubRecord[] {
  const local = readLocalRecords()[moduleName];
  if (local) return local;
  return seedRecords[moduleName] ?? fallback.map((record, index) => ({
    id: `${moduleName}-${index}`,
    title: record.title,
    value: record.value,
    owner: "Reviewer",
    status: index === 1 ? "Amber" : "Green",
    lastReviewed: "15 Sep 2026",
    source: "synthetic" as const,
  }));
}

export function addRecord(moduleName: string, input: Pick<HubRecord, "title" | "value" | "owner" | "status">) {
  const records = readLocalRecords();
  const current = getRecords(moduleName, []);
  const nextRecord: HubRecord = {
    ...input,
    id: `${moduleName}-${Date.now()}`,
    lastReviewed: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    source: "local",
  };
  records[moduleName] = [...current, nextRecord];
  writeLocalRecords(records);
  return nextRecord;
}

export function getConnectionReadiness() {
  const missing: string[] = [];
  if (!repositoryConfig.dataverseUrl) missing.push("Dataverse environment URL");
  if (!repositoryConfig.sharePointSiteUrl) missing.push("SharePoint evidence site URL");
  if (!repositoryConfig.sharePointEvidenceLibrary) missing.push("SharePoint evidence library");
  if (repositoryConfig.runtimeMode === "live" && !repositoryConfig.liveAdapterConfigured) missing.push("approved live adapter");
  return {
    ready: missing.length === 0,
    mode: repositoryConfig.mode,
    runtimeMode: repositoryConfig.runtimeMode,
    liveAdapterConfigured: repositoryConfig.liveAdapterConfigured,
    missing,
    message:
      repositoryConfig.runtimeMode === "live" && !repositoryConfig.liveAdapterConfigured
        ? "Live mode is selected, but no approved live adapter is configured. The application is fail-closed."
        : missing.length === 0
          ? "Connection placeholders are configured."
          : "Demo mode is active. Synthetic and local persistence are enabled; live connectors remain intentionally unconfigured.",
  };
}

export function getRuntimeConfig() {
  return {
    runtimeMode: repositoryConfig.runtimeMode,
    liveAdapterConfigured: repositoryConfig.liveAdapterConfigured,
    canUseLiveData: false,
  };
}

function findStageGate(stage: string, gates: StageGateSummary[]): StageGateSummary | undefined {
  return gates.find((gate) => gate.name.toLowerCase().includes(stage.toLowerCase()));
}

// Assembles readable stage documentation entirely from local/synthetic data (stage templates,
// My Work tasks, stage gates, and the selected engagement). No live connector calls are made,
// so this keeps the Demo/Live boundary intact regardless of the active runtime mode.
export function generateStageDocumentation(
  context: StageDocumentationContext,
  selectedSections: StageDocumentationSectionSelection,
): string {
  const template = stageTemplates.find((item) => item.stage === context.stage);
  const generatedAt = context.generatedAt ?? new Date();
  const stageTasks = context.workTasks.filter((task) => task.stage === context.stage);
  const gate = findStageGate(context.stage, context.stageGates);
  const engagementOnStage = context.engagementStage === context.stage;
  const enabled = (sectionId: StageDocumentationSectionId) => selectedSections[sectionId];

  const gaps: string[] = [];
  if (stageTasks.length === 0) {
    gaps.push(`No My Work tasks are currently tracked for the ${context.stage} stage in this demo data set; add one to begin evidencing progress.`);
  } else {
    for (const task of stageTasks) {
      if (task.status === "Blocked") {
        gaps.push(`Task "${task.title}" is Blocked: ${task.blocker || "no blocker reason recorded"} (owner: ${task.owner}).`);
      }
      if (task.evidenceStatus !== "Accepted") {
        gaps.push(`Evidence for "${task.title}" is ${task.evidenceStatus.toLowerCase()}, not yet Accepted (${task.evidenceLink || "no evidence link recorded"}).`);
      }
    }
  }
  if (gate && gate.status !== "Green") {
    gaps.push(`Stage gate "${gate.name}" is ${gate.status}: ${gate.note} (owner: ${gate.owner}).`);
  } else if (!gate) {
    gaps.push(`No stage gate is currently tracked against "${context.stage}" in the demo gate watchlist.`);
  }
  if (engagementOnStage) {
    if (context.engagementReadiness < 70) {
      gaps.push(`Engagement readiness is ${context.engagementReadiness}%, below the 70% working threshold for this stage.`);
    }
    if (context.engagementEvidence < 70) {
      gaps.push(`Engagement evidence completeness is ${context.engagementEvidence}%, below the 70% working threshold for this stage.`);
    }
    if (context.engagementHealth !== "Green") {
      gaps.push(`Engagement health is ${context.engagementHealth} while in the ${context.stage} stage.`);
    }
  }
  if (gaps.length === 0) {
    gaps.push("No known gaps recorded for this stage in the current demo data.");
  }

  const evidence: string[] = [];
  if (template) {
    for (const input of template.requiredInputs) evidence.push(`Confirm required input is authoritative and available: ${input}.`);
    for (const output of template.expectedOutputs) evidence.push(`Capture and review evidence for expected output: ${output}.`);
  }
  for (const task of stageTasks) {
    evidence.push(`${task.title}: ${task.evidence} (${task.evidenceLink || "link to be added"}) — status: ${task.evidenceStatus}.`);
  }

  const owners: string[] = [];
  owners.push(`Engagement owner: ${context.engagementOwner} (${context.engagementName}).`);
  if (gate) owners.push(`Stage gate owner: ${gate.owner} (${gate.name}).`);
  for (const task of stageTasks) owners.push(`${task.title}: ${task.owner}, due ${task.dueDate}.`);
  if (stageTasks.length === 0) owners.push("No task owners or due dates are recorded for this stage yet.");

  const nextActions: string[] = [];
  for (const task of stageTasks) {
    if (task.status === "Blocked") nextActions.push(`Resolve blocker for "${task.title}": ${task.blocker || "confirm and record the blocker"} (owner: ${task.owner}, due ${task.dueDate}).`);
    else if (task.status !== "Complete") nextActions.push(`Advance "${task.title}" toward: ${task.definitionOfDone} (owner: ${task.owner}, due ${task.dueDate}).`);
  }
  if (stageTasks.length === 0) nextActions.push(`Create a My Work task for the ${context.stage} stage to track evidence, ownership, and definition of done.`);
  if (template) nextActions.push(`Confirm exit criteria before advancing the gate: ${template.exitCriteria}.`);

  const linkedItems: string[] = [];
  if (context.risks || context.decisions) {
    const linkedRiskIds = new Set(
      stageTasks
        .filter((task) => task.linkedRecordType === "Risk" && task.linkedRecordId)
        .map((task) => task.linkedRecordId as string),
    );
    const linkedDecisionIds = new Set(
      stageTasks
        .filter((task) => task.linkedRecordType === "Decision" && task.linkedRecordId)
        .map((task) => task.linkedRecordId as string),
    );
    for (const risk of context.risks ?? []) {
      if (linkedRiskIds.has(risk.id)) linkedItems.push(`Risk: ${risk.title} (${risk.severity}, owner: ${risk.owner}, due ${risk.due}).`);
    }
    for (const decision of context.decisions ?? []) {
      if (linkedDecisionIds.has(decision.id)) linkedItems.push(`Decision: ${decision.title} (${decision.status}, owner: ${decision.owner}).`);
    }
  }
  if (linkedItems.length === 0) linkedItems.push(`No risks or decisions are currently linked to ${context.stage} stage tasks.`);

  const stageChains = context.risks && context.decisions
    ? getEvidenceChains(context.workTasks, context.stageGates, context.risks, context.decisions)
      .filter((chain) => chain.sourceType === "WorkTask" && stageTasks.some((task) => task.id === chain.sourceId))
    : [];
  const evidenceChainSummary: string[] = [];
  if (stageChains.length === 0) {
    evidenceChainSummary.push(`No stage-specific evidence chains are available for ${context.stage} yet.`);
  } else {
    const green = stageChains.filter((chain) => chain.overallStatus === "Green").length;
    const amber = stageChains.filter((chain) => chain.overallStatus === "Amber").length;
    const red = stageChains.filter((chain) => chain.overallStatus === "Red").length;
    evidenceChainSummary.push(`Tracked chains: ${stageChains.length} total (${green} Green, ${amber} Amber, ${red} Red).`);
    for (const chain of stageChains.filter((item) => item.overallStatus !== "Green")) {
      const attentionNodes = chain.nodes
        .filter((node) => node.status !== "Green")
        .map((node) => `${evidenceChainNodeLabels[node.kind]} — ${node.label}`)
        .join("; ");
      evidenceChainSummary.push(`${chain.title}: ${attentionNodes}.`);
    }
  }

  const portfolioSnapshot = context.portfolio?.length
    ? context.portfolio.map((engagement) => `${engagement.selected ? "* " : "- "}${engagement.name} — ${engagement.stage} · ${engagement.health} health · ${engagement.progress}% progress · ${engagement.readiness}% readiness · ${engagement.evidence}% evidence`)
    : [`Portfolio snapshot is not available in the current context.`];

  const lines: string[] = [];
  lines.push(`# ${context.stage} stage documentation`);
  lines.push("");
  lines.push(`**Engagement:** ${context.engagementName} (current stage: ${context.engagementStage}, health: ${context.engagementHealth})`);
  lines.push(`**Runtime mode:** ${context.runtimeMode === "live" ? "Live" : "Demo"} — generated locally from ${context.runtimeMode === "live" ? "connected" : "synthetic/local"} data only`);
  lines.push(`**Generated:** ${generatedAt.toLocaleString()}`);
  lines.push("");
  const addSection = (title: string, content: string[]) => {
    if (content.length === 0) return;
    lines.push(`## ${title}`);
    lines.push(...content);
    lines.push("");
  };
  if (enabled("purpose")) addSection("Purpose", [template ? template.purpose : `No stage template is defined for "${context.stage}" in this demo data set.`]);
  if (enabled("requiredInputs")) addSection("Required inputs", template ? template.requiredInputs.map((item) => `- ${item}`) : ["- Not defined for this stage in the current demo template."]);
  if (enabled("expectedOutputs")) addSection("Expected outputs", template ? template.expectedOutputs.map((item) => `- ${item}`) : ["- Not defined for this stage in the current demo template."]);
  if (enabled("decisionRights")) addSection("Decision rights", [template ? template.decisionRights : "Not defined for this stage in the current demo template."]);
  if (enabled("exitCriteria")) addSection("Exit criteria", [template ? template.exitCriteria : "Not defined for this stage in the current demo template."]);
  if (enabled("knownGaps")) addSection("Known gaps (from current demo data)", gaps.map((item) => `- ${item}`));
  if (enabled("evidenceToGather")) addSection("Evidence to gather", evidence.map((item) => `- ${item}`));
  if (enabled("ownersAndDueDates")) addSection("Owners and due dates", owners.map((item) => `- ${item}`));
  if (enabled("nextActions")) addSection("Next actions", nextActions.map((item) => `- ${item}`));
  if (enabled("linkedRisksDecisions")) addSection("Linked risks and decisions", linkedItems.map((item) => `- ${item}`));
  if (enabled("evidenceChainSummary")) addSection("Evidence chain summary", evidenceChainSummary.map((item) => `- ${item}`));
  if (enabled("engagementPortfolioSnapshot")) addSection("Engagement portfolio snapshot", portfolioSnapshot);
  lines.push("---");
  lines.push("Generated by the Data Protection Delivery Hub demo from local/synthetic data. It is not a substitute for governed delivery records or authorized approvals.");
  return lines.join("\n");
}

export type ProjectStatusContext = {
  engagements: StageDocumentationPortfolioItem[];
  workTasks: WorkTask[];
  stageGates: StageGateSummary[];
  risks: EvidenceChainRisk[];
  decisions: EvidenceChainDecision[];
  runtimeMode: RuntimeMode;
  generatedAt?: Date;
};

// Assembles a single, comprehensive project/portfolio status report covering every
// engagement, quality metric, improvement action, stage gate, lifecycle stage, risk,
// decision, and evidence chain — not just one selected stage. Built entirely from
// local/synthetic data already in memory; no live connector calls are made, so the
// Demo/Live boundary stays intact regardless of the active runtime mode. This is the
// "generate everything" counterpart to the selectable Stage Report Builder.
export function generateProjectStatusReport(context: ProjectStatusContext): string {
  const generatedAt = context.generatedAt ?? new Date();
  const improvements = getPracticeImprovements();
  const chains = getEvidenceChains(context.workTasks, context.stageGates, context.risks, context.decisions);

  const lines: string[] = [];
  lines.push("# Data Protection Delivery Hub — project status report");
  lines.push("");
  lines.push(`**Runtime mode:** ${context.runtimeMode === "live" ? "Live" : "Demo"} — generated locally from ${context.runtimeMode === "live" ? "connected" : "synthetic/local"} data only`);
  lines.push(`**Generated:** ${generatedAt.toLocaleString()}`);
  lines.push("");

  const addSection = (title: string, content: string[]) => {
    if (content.length === 0) return;
    lines.push(`## ${title}`);
    lines.push(...content);
    lines.push("");
  };

  // Executive summary
  const healthCounts = { Green: 0, Amber: 0, Red: 0 } as Record<string, number>;
  for (const engagement of context.engagements) healthCounts[engagement.health] = (healthCounts[engagement.health] ?? 0) + 1;
  const avg = (values: number[]) => values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : 0;
  const avgReadiness = avg(context.engagements.map((item) => item.readiness));
  const avgEvidence = avg(context.engagements.map((item) => item.evidence));
  const redGates = context.stageGates.filter((gate) => gate.status !== "Green").length;
  const blockedTasks = context.workTasks.filter((task) => task.status === "Blocked").length;
  addSection("Executive summary", [
    `${context.engagements.length} active engagement(s): ${healthCounts.Green ?? 0} Green, ${healthCounts.Amber ?? 0} Amber, ${healthCounts.Red ?? 0} Red.`,
    `Average readiness ${avgReadiness}% and average evidence completeness ${avgEvidence}% across active engagements.`,
    `${redGates} of ${context.stageGates.length} tracked stage gate(s) are not Green.`,
    `${blockedTasks} My Work task(s) are currently Blocked.`,
    `${context.risks.length} tracked risk(s) and ${context.decisions.length} open decision(s) in the RAID register.`,
  ]);

  // Engagement portfolio
  addSection("Engagement portfolio", context.engagements.map((item) => `- ${item.name} — stage: ${item.stage} · health: ${item.health} · progress ${item.progress}% · readiness ${item.readiness}% · evidence ${item.evidence}%`));

  // Quality metrics
  addSection("Quality metrics", qualityMetrics.map((metric) => `- ${metric.name} (${metric.period}, ${metric.cohort}): baseline ${metric.baseline}${metric.unit === "%" ? "%" : ""}, actual ${metric.actual}${metric.unit === "%" ? "%" : ""}, target ${metric.target}${metric.unit === "%" ? "%" : ""} (trend: ${metric.direction === "up" ? "improving is higher" : "improving is lower"}).`));

  // Practice improvement backlog
  addSection("Practice improvement backlog", improvements.map((item) => `- ${item.title} (${item.status}) — ${item.problem} Owner: ${item.owner}. Baseline ${item.baseline} -> Target ${item.target}. Review ${item.reviewDate}.`));

  // Stage gate watchlist
  addSection("Stage gate watchlist", context.stageGates.map((gate) => `- ${gate.name}: ${gate.status} — ${gate.note} (owner: ${gate.owner}).`));

  // Lifecycle stage reference (all stages)
  addSection("Lifecycle stage reference", stageTemplates.map((template) => `- ${template.stage}: ${template.purpose} Exit criteria: ${template.exitCriteria}`));

  // My Work summary
  const byStatus = (status: WorkTaskStatus) => context.workTasks.filter((task) => task.status === status);
  addSection("My Work summary", [
    `Not started: ${byStatus("Not started").length} · In progress: ${byStatus("In progress").length} · Blocked: ${byStatus("Blocked").length} · Ready for review: ${byStatus("Ready for review").length} · Complete: ${byStatus("Complete").length}.`,
    ...context.workTasks.filter((task) => task.status === "Blocked").map((task) => `- Blocked: "${task.title}" (${task.stage}) — ${task.blocker || "no blocker reason recorded"} (owner: ${task.owner}, due ${task.dueDate}).`),
  ]);

  // Risks and decisions register
  addSection("Risks and decisions register", [
    ...context.risks.map((risk) => `- Risk: ${risk.title} (${risk.severity}, owner: ${risk.owner}, due ${risk.due}).`),
    ...context.decisions.map((decision) => `- Decision: ${decision.title} (${decision.status}, owner: ${decision.owner}).`),
  ]);

  // Evidence chain summary (whole hub, not one stage)
  const green = chains.filter((chain) => chain.overallStatus === "Green").length;
  const amberCount = chains.filter((chain) => chain.overallStatus === "Amber").length;
  const redCount = chains.filter((chain) => chain.overallStatus === "Red").length;
  addSection("Evidence chain summary", [
    `Tracked chains: ${chains.length} total (${green} Green, ${amberCount} Amber, ${redCount} Red).`,
    ...chains.filter((chain) => chain.overallStatus !== "Green").map((chain) => {
      const attentionNodes = chain.nodes.filter((node) => node.status !== "Green").map((node) => `${evidenceChainNodeLabels[node.kind]} — ${node.label}`).join("; ");
      return `- ${chain.title} (${chain.stage}, owner: ${chain.owner}): ${attentionNodes}.`;
    }),
  ]);

  // Reusable assets
  addSection("Knowledge and reuse", reusableAssets.map((asset) => `- ${asset.title} (${asset.type}) — sanitization: ${asset.sanitization}, review: ${asset.reviewState}, adopted by ${asset.adoptionCount} engagement(s) (owner: ${asset.owner}).`));

  // Connection readiness / Demo-Live boundary
  const readiness = getConnectionReadiness();
  addSection("Connection readiness (Demo/Live boundary)", [
    `Mode: ${readiness.runtimeMode === "live" ? "Live" : "Demo"}. ${readiness.message}`,
    ...(readiness.missing.length > 0 ? [`Missing before Live can be enabled: ${readiness.missing.join(", ")}.`] : []),
  ]);

  lines.push("---");
  lines.push("Generated by the Data Protection Delivery Hub demo from local/synthetic data. It is not a substitute for governed delivery records or authorized approvals. For a filtered, section-selectable single-stage report, use the Stage Report Builder above.");
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Evidence chain model
//
// Reusable, read-only view that traces: required input/requirement -> evidence
// item -> review status -> linked task/decision -> readiness/gate impact.
// Every chain is assembled from local/synthetic sources already present in this
// module (stage templates, My Work tasks, stage gates) plus the risk/decision
// records the caller already has in memory. No live connector calls are made,
// so the Demo/Live boundary stays intact regardless of the active runtime mode.
// ---------------------------------------------------------------------------

export type EvidenceChainStatus = "Green" | "Amber" | "Red";

export type EvidenceChainNodeKind = "requirement" | "evidence" | "review" | "link" | "gate";

export type EvidenceChainNode = {
  kind: EvidenceChainNodeKind;
  label: string;
  status: EvidenceChainStatus;
  detail: string;
  nextAction: string;
};

export type EvidenceChainSourceType = "WorkTask" | "Risk" | "Decision";

export type EvidenceChain = {
  id: string;
  title: string;
  stage: string;
  owner: string;
  sourceType: EvidenceChainSourceType;
  sourceId: string;
  overallStatus: EvidenceChainStatus;
  nodes: EvidenceChainNode[];
};

export type EvidenceChainRisk = { id: string; title: string; severity: string; owner: string; due: string };
export type EvidenceChainDecision = { id: string; title: string; status: string; owner: string };

export const evidenceChainNodeLabels: Record<EvidenceChainNodeKind, string> = {
  requirement: "Requirement",
  evidence: "Evidence",
  review: "Review",
  link: "Linked task/decision",
  gate: "Readiness impact",
};

function worstEvidenceChainStatus(statuses: EvidenceChainStatus[]): EvidenceChainStatus {
  if (statuses.includes("Red")) return "Red";
  if (statuses.includes("Amber")) return "Amber";
  return "Green";
}

function evidenceStatusTone(status: WorkTask["evidenceStatus"]): EvidenceChainStatus {
  if (status === "Accepted") return "Green";
  if (status === "Submitted" || status === "In progress") return "Amber";
  return "Red"; // Not started / Rejected
}

function workTaskStatusTone(status: WorkTaskStatus): EvidenceChainStatus {
  if (status === "Complete") return "Green";
  if (status === "In progress" || status === "Ready for review") return "Amber";
  return "Red"; // Not started / Blocked
}

function riskSeverityTone(severity: string): EvidenceChainStatus {
  const value = severity.toLowerCase();
  if (value.includes("critical") || value.includes("high")) return "Red";
  if (value.includes("medium")) return "Amber";
  return "Green";
}

function decisionStatusTone(status: string): EvidenceChainStatus {
  const value = status.toLowerCase();
  if (value.includes("overdue")) return "Red";
  if (value.includes("due soon") || value.includes("pending")) return "Amber";
  return "Green";
}

const evidenceReviewLabels: Record<WorkTask["evidenceStatus"], string> = {
  "Not started": "Not submitted for review",
  "In progress": "Being prepared for review",
  Submitted: "Pending reviewer disposition",
  Accepted: "Reviewed and accepted",
  Rejected: "Returned for rework",
};

function buildWorkTaskChain(
  task: WorkTask,
  gates: StageGateSummary[],
  riskMap: Map<string, EvidenceChainRisk>,
  decisionMap: Map<string, EvidenceChainDecision>,
): EvidenceChain {
  const template = stageTemplates.find((item) => item.stage === task.stage);
  const gate = findStageGate(task.stage, gates);
  const evidenceTone = evidenceStatusTone(task.evidenceStatus);

  const requirementNode: EvidenceChainNode = {
    kind: "requirement",
    label: template ? `${task.stage} required inputs` : `${task.stage} requirement`,
    status: template ? "Green" : "Amber",
    detail: template
      ? `Required before this stage exits: ${template.requiredInputs.join(", ")}.`
      : `No stage template is registered for "${task.stage}"; confirm the required inputs manually.`,
    nextAction: template
      ? "Confirm each required input is authoritative and available."
      : "Register a stage template covering this requirement in Administration.",
  };

  const evidenceNode: EvidenceChainNode = {
    kind: "evidence",
    label: task.evidence,
    status: evidenceTone,
    detail: `${task.evidenceLink || "No evidence link recorded"} — status: ${task.evidenceStatus}.`,
    nextAction: evidenceTone === "Green" ? "Evidence is accepted; no action needed." : "Attach or update the authoritative evidence link and submit it for review.",
  };

  const reviewNode: EvidenceChainNode = {
    kind: "review",
    label: evidenceReviewLabels[task.evidenceStatus],
    status: evidenceTone,
    detail: `Decision/approval: ${task.decisionApproval}.`,
    nextAction:
      evidenceTone === "Green"
        ? "No further review action required."
        : task.evidenceStatus === "Rejected"
          ? "Address reviewer feedback and resubmit the evidence."
          : "Route the evidence to the assigned reviewer for disposition.",
  };

  let linkNode: EvidenceChainNode;
  if (task.linkedRecordType === "Risk" && task.linkedRecordId) {
    const risk = riskMap.get(task.linkedRecordId);
    linkNode = {
      kind: "link",
      label: risk ? `Risk: ${risk.title}` : "Linked risk",
      status: risk ? riskSeverityTone(risk.severity) : "Amber",
      detail: risk ? `${risk.severity} priority, owned by ${risk.owner}, due ${risk.due}.` : "The linked risk record could not be found in the register.",
      nextAction: "Review and update the risk mitigation in RAID & Decisions.",
    };
  } else if (task.linkedRecordType === "Decision" && task.linkedRecordId) {
    const decision = decisionMap.get(task.linkedRecordId);
    linkNode = {
      kind: "link",
      label: decision ? `Decision: ${decision.title}` : "Linked decision",
      status: decision ? decisionStatusTone(decision.status) : "Amber",
      detail: decision ? `${decision.status}, owned by ${decision.owner}.` : "The linked decision record could not be found in the register.",
      nextAction: "Confirm the decision outcome and rationale in RAID & Decisions.",
    };
  } else {
    const taskTone = workTaskStatusTone(task.status);
    linkNode = {
      kind: "link",
      label: `My Work: ${task.title}`,
      status: taskTone,
      detail: `${task.status} · owner ${task.owner} · due ${task.dueDate}${task.blocker !== "None" ? ` · blocker: ${task.blocker}` : ""}.`,
      nextAction: taskTone === "Green" ? "Task is closed; no action needed." : "Open My Work to update owner, evidence, or status.",
    };
  }

  const gateNode: EvidenceChainNode = {
    kind: "gate",
    label: gate ? gate.name : `${task.stage} gate`,
    status: gate ? (gate.status as EvidenceChainStatus) : "Amber",
    detail: gate ? `${gate.status} — ${gate.note} (owner: ${gate.owner}).` : `No stage gate is currently tracked for "${task.stage}" in the demo watchlist.`,
    nextAction: "Open Readiness & Assurance to review mandatory criteria and the gate recommendation.",
  };

  const nodes = [requirementNode, evidenceNode, reviewNode, linkNode, gateNode];
  return {
    id: `chain-task-${task.id}`,
    title: task.title,
    stage: task.stage,
    owner: task.owner,
    sourceType: "WorkTask",
    sourceId: task.id,
    overallStatus: worstEvidenceChainStatus(nodes.map((node) => node.status)),
    nodes,
  };
}

function buildGapChain(
  sourceType: "Risk" | "Decision",
  id: string,
  title: string,
  owner: string,
  tone: EvidenceChainStatus,
): EvidenceChain {
  const label = sourceType.toLowerCase();
  const nodes: EvidenceChainNode[] = [
    {
      kind: "requirement",
      label: `${sourceType} action required`,
      status: tone,
      detail: `"${title}" is an open ${label} with no evidence trail yet.`,
      nextAction: `Create a My Work task to define the expected outcome for this ${label}.`,
    },
    {
      kind: "evidence",
      label: "No evidence captured",
      status: "Red",
      detail: `No evidence has been started for "${title}".`,
      nextAction: "Create the My Work task, then attach evidence and a link.",
    },
    {
      kind: "review",
      label: "Not submitted for review",
      status: "Red",
      detail: "No reviewer disposition exists because no task has been created yet.",
      nextAction: "Create the task before requesting a review.",
    },
    {
      kind: "link",
      label: `${sourceType}: ${title}`,
      status: tone,
      detail: `Owned by ${owner}. No linked My Work task exists yet.`,
      nextAction: "Create or update a My Work task from this record.",
    },
    {
      kind: "gate",
      label: "Readiness impact",
      status: tone === "Green" ? "Amber" : tone,
      detail: `An unresolved ${label} without evidence increases risk to the next gate decision.`,
      nextAction: "Open Readiness & Assurance to assess the impact on the gate recommendation.",
    },
  ];
  return {
    id: `chain-${label}-${id}`,
    title,
    stage: "Unassigned",
    owner,
    sourceType,
    sourceId: id,
    overallStatus: worstEvidenceChainStatus(nodes.map((node) => node.status)),
    nodes,
  };
}

// Assembles the interactive evidence chains entirely from in-memory local/synthetic
// inputs (My Work tasks, stage gates, and the risk/decision records already loaded
// by the caller from seed data). No live connector calls are made. Risks and
// decisions with no linked My Work task are surfaced as "gap" chains so missing
// or unaccepted evidence is obvious rather than silently absent.
export function getEvidenceChains(
  workTasks: WorkTask[],
  gates: StageGateSummary[],
  risks: EvidenceChainRisk[],
  decisions: EvidenceChainDecision[],
): EvidenceChain[] {
  const riskMap = new Map(risks.map((risk) => [risk.id, risk]));
  const decisionMap = new Map(decisions.map((decision) => [decision.id, decision]));
  const linkedRecordIds = new Set(workTasks.filter((task) => task.linkedRecordId).map((task) => task.linkedRecordId));

  const taskChains = workTasks.map((task) => buildWorkTaskChain(task, gates, riskMap, decisionMap));
  const gapRiskChains = risks
    .filter((risk) => !linkedRecordIds.has(risk.id))
    .map((risk) => buildGapChain("Risk", risk.id, risk.title, risk.owner, riskSeverityTone(risk.severity)));
  const gapDecisionChains = decisions
    .filter((decision) => !linkedRecordIds.has(decision.id))
    .map((decision) => buildGapChain("Decision", decision.id, decision.title, decision.owner, decisionStatusTone(decision.status)));

  return [...taskChains, ...gapRiskChains, ...gapDecisionChains];
}
