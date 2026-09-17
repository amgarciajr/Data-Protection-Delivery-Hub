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
  requiredInputs: string[];
  expectedOutputs: string[];
  decisionRights: string;
  exitCriteria: string;
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

export const repositoryConfig: RepositoryConfig = {
  mode: import.meta.env.VITE_HUB_MODE === "live" ? "dataverse" : "local",
  runtimeMode: import.meta.env.VITE_HUB_MODE === "live" ? "live" : "demo",
  liveAdapterConfigured: import.meta.env.VITE_LIVE_ADAPTER_CONFIGURED === "true",
  dataverseUrl: import.meta.env.VITE_DATAVERSE_URL ?? "",
  solutionName: "DataProtectionDeliveryHub",
  publisherPrefix: import.meta.env.VITE_PUBLISHER_PREFIX ?? "dpdh",
  sharePointSiteUrl: import.meta.env.VITE_SHAREPOINT_SITE_URL ?? "",
  sharePointEvidenceLibrary: import.meta.env.VITE_SHAREPOINT_EVIDENCE_LIBRARY ?? "",
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
  { stage: "Discover", requiredInputs: ["Approved charter", "Workshop plan", "Evidence request register"], expectedOutputs: ["Current-state findings", "Validated questions", "Initial risks"], decisionRights: "Workstream Lead prepares; Engagement Manager confirms scope", exitCriteria: "Findings reviewed and evidence gaps owned" },
  { stage: "Design", requiredInputs: ["Approved requirements", "Architecture options", "Control mappings"], expectedOutputs: ["Approved design", "Decision log", "Exception records"], decisionRights: "Architect approves design; authorized approver accepts exceptions", exitCriteria: "Mandatory design criteria green and decisions recorded" },
  { stage: "Validate", requiredInputs: ["Test plan", "Configured controls", "Evidence register"], expectedOutputs: ["Test results", "Defect disposition", "Readiness recommendation"], decisionRights: "Reviewer validates evidence; Engagement Manager recommends gate outcome", exitCriteria: "Mandatory tests passed and evidence accepted" },
  { stage: "Transition", requiredInputs: ["Runbooks", "Support model", "Training plan"], expectedOutputs: ["Handoff acceptance", "Named operators", "Hypercare plan"], decisionRights: "Engagement Manager confirms acceptance with customer owner", exitCriteria: "Primary and backup operators confirm readiness" },
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
