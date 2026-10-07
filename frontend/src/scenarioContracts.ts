import { annualFields, currentFactKeys, guardAssessment, guardDatedInput, guardDecision, metric, type Assessment, type Decision, type DatedRequest, type Factor, type Metric, type Period, type Policy, type Trace } from "./contracts";
import { date, finite, finiteJson, guardRecording, hash, object, requireCase, revision, sameJson, text, timestamp, uuid, type Page, type Recording, type StoredCase } from "./caseContracts";
type Obj = Record<string, unknown>;
export const shockKeys = ["revenue_change", "cogs_change", "operating_expense_change", "proposed_rate_change_bps"] as const;
export type Assumptions = Record<(typeof shockKeys)[number], number>;
export type ScenarioCommand = {
    scenario_key: string;
    name: string;
    rationale: string;
    assumptions: Assumptions;
};
export type PreviewCommand = {
    schema_version: "commercial-scenario-preview-v1";
    baseline_run_id: string;
    scenarios: ScenarioCommand[];
};
export type ComparisonCommand = Omit<PreviewCommand, "schema_version"> & {
    schema_version: "commercial-scenario-comparison-create-v1";
    expected_preview_fingerprint: string;
};
export type Headroom = {
    comparison_operator: ">=" | ">";
    approval_threshold: number;
    decline_threshold: number | null;
    baseline_approval: number | null;
    projected_approval: number | null;
    baseline_decline: number | null;
    projected_decline: number | null;
};
export type ComparisonMetric = {
    metric: string;
    baseline_fact_id: string;
    projected_fact_id: string;
    unit: string;
    baseline_value: number | null;
    projected_value: number | null;
    delta: number | null;
    delta_explanation: string | null;
    policy_headroom: Headroom | null;
};
export type FactorChange = {
    name: string;
    baseline: Factor;
    projected: Factor;
    changed: boolean;
    projected_fact_id: string;
    basis: "observed_history" | "projected_current";
};
export type Reason = Decision["reasons"][number];
export type ScenarioResult = ScenarioCommand & {
    coverage_basis: "stressed_latest_period_current_pro_forma";
    projection_inputs: {
        operating: DatedRequest["years"][number];
        proposed_loan: DatedRequest["proposed_loan"];
        existing_debt: DatedRequest["existing_debt"];
        guarantors: DatedRequest["guarantors"];
        working_capital: DatedRequest["working_capital"];
    };
    current_facts: Assessment["current_facts"];
    guarantor_contributions: Assessment["guarantor_contributions"];
    decision: Decision;
    calculation_trace: Trace[];
    comparisons: ComparisonMetric[];
    factor_changes: FactorChange[];
    outcome_change: {
        baseline: Decision["outcome"];
        projected: Decision["outcome"];
        changed: boolean;
    };
    reason_changes: {
        code: string;
        baseline: Reason | null;
        projected: Reason | null;
        change: "added" | "removed" | "changed";
    }[];
};
export type ScenarioPreview = {
    schema_version: "commercial-scenario-preview-v1";
    serialization_version: "scenario-preview-json-v1";
    scenario_definition_version: string;
    calculation_version: string;
    persisted: false;
    baseline: {
        case_id: string;
        revision: number;
        run_id: string;
        input_hash: string;
        payload_hash: string;
        assessment: Assessment;
    };
    selected_period: Period;
    assumptions_as_of: string;
    units: DatedRequest["units"];
    policy_snapshot: Policy;
    scenarios: ScenarioResult[];
    fingerprint: {
        algorithm: "sha256";
        value: string;
        content: string;
    };
    held_fixed_assumptions: string[];
    disclaimer: string;
};
export type ComparisonRecord = {
    schema_version: "commercial-scenario-comparison-v1";
    storage_serialization_version: "scenario-comparison-json-v1";
    persisted: true;
    comparison_id: string;
    case_id: string;
    baseline_revision: number;
    baseline_run_id: string;
    recorded_at: string;
    actor: "prototype-demo-unverified";
    recording: Recording;
    preview: Obj;
    payload_hash: string;
};
export type StoredComparison = {
    record: ComparisonRecord;
    etag: string;
    preview: ScenarioPreview | null;
    compatibility: string | null;
};
export type ComparisonSummary = {
    comparison_id: string;
    case_id: string;
    baseline_revision: number;
    baseline_run_id: string;
    recorded_at: string;
    preview_fingerprint: string;
    scenario_count: number;
    scenarios: {
        scenario_key: string;
        name: string;
    }[];
    policy_version: string;
    schema_version: string;
    storage_serialization_version: string;
    preview_schema_version: string;
    preview_serialization_version: string;
    scenario_definition_version: string;
    calculation_version: string;
};
const schema = "commercial-scenario-preview-v1", serialization = "scenario-preview-json-v1";
export function exact(value: Obj, keys: readonly string[]) { requireCase(Object.keys(value).length === keys.length && keys.every(k => Object.prototype.hasOwnProperty.call(value, k)), "scenario fields"); }
// Python's str.strip whitespace set. FEFF is deliberately not included.
export function scenarioText(value: unknown, max: number): string {
    requireCase(text(value), "scenario text");
    const result = value.replace(/^[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+|[\u0009-\u000d\u001c-\u0020\u0085\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]+$/gu, "");
    requireCase(result.length > 0 && [...result].length <= max, `nonblank scenario text, at most ${max} characters`);
    return result;
}
export function parseShock(raw: string, percentage: boolean): number {
    const value = raw.trim();
    requireCase(/^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(value), "Enter a finite decimal change");
    const number = Number(value.replace(/,/g, "")) / (percentage ? 100 : 1);
    requireCase(finite(number) && (!percentage || number >= -1), "Percentage changes must be at least -100%; all changes must be finite");
    return number;
}
export function normalizedScenario(value: unknown): ScenarioCommand {
    const s = object(value, "scenario"), a = object(s.assumptions, "shocks");
    requireCase(text(s.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(s.scenario_key), "scenario key");
    exact(a, shockKeys);
    for (const k of shockKeys)
        requireCase(finite(a[k]) && (k === "proposed_rate_change_bps" || Number(a[k]) >= -1), "finite explicit shock");
    return { scenario_key: s.scenario_key, name: scenarioText(s.name, 120), rationale: scenarioText(s.rationale, 2000), assumptions: a as Assumptions };
}
export function guardScenarioCommand(value: unknown): PreviewCommand | ComparisonCommand {
    const c = object(value, "scenario command"), retained = c.schema_version === "commercial-scenario-comparison-create-v1";
    requireCase(retained || c.schema_version === schema, "scenario command version");
    exact(c, ["schema_version", "baseline_run_id", "scenarios", ...(retained ? ["expected_preview_fingerprint"] : [])]);
    requireCase(uuid(c.baseline_run_id) && String(c.baseline_run_id).toLowerCase() === c.baseline_run_id, "canonical baseline run");
    if (retained)
        requireCase(hash(c.expected_preview_fingerprint), "reviewed preview fingerprint");
    requireCase(Array.isArray(c.scenarios) && c.scenarios.length >= 1 && c.scenarios.length <= 10, "1–10 scenarios");
    const keys = new Set<string>();
    for (const s of c.scenarios) {
        const row = object(s, "scenario command row");
        exact(row, ["scenario_key", "name", "rationale", "assumptions"]);
        const normalized = normalizedScenario(s);
        requireCase(sameJson(normalized, s) && !keys.has(normalized.scenario_key), "normalized unique scenario command");
        keys.add(normalized.scenario_key);
    }
    return c as PreviewCommand | ComparisonCommand;
}
export function previewCommand(p: ScenarioPreview | Obj): PreviewCommand {
    const b = object(p.baseline, "preview baseline");
    requireCase(Array.isArray(p.scenarios), "preview scenarios");
    return guardScenarioCommand({ schema_version: schema, baseline_run_id: b.run_id, scenarios: p.scenarios.map(normalizedScenario) }) as PreviewCommand;
}
function array(value: unknown, label: string): unknown[] { requireCase(Array.isArray(value), label); return value; }
function nullableNumber(v: unknown) { return v === null || finite(v); }
function canonicalId(v: unknown) { return uuid(v) && v.toLowerCase() === v; }
function baselineEnvelope(p: Obj) {
    requireCase(p.schema_version === schema && p.serialization_version === serialization && p.persisted === false && text(p.scenario_definition_version) && text(p.calculation_version), "preview envelope versions");
    const b = object(p.baseline, "baseline evidence");
    requireCase(canonicalId(b.case_id) && canonicalId(b.run_id) && revision(b.revision) && hash(b.input_hash) && hash(b.payload_hash), "baseline evidence identity");
    const a = object(b.assessment, "original assessment"), fp = object(p.fingerprint, "preview fingerprint");
    requireCase(fp.algorithm === "sha256" && hash(fp.value) && fp.content === "baseline_identity+payload_hash+normalized_command+policy_snapshot+versions", "preview fingerprint");
    const selected = object(p.selected_period, "selected operating period");
    requireCase(date(selected.period_start) && date(selected.period_end) && selected.period_start <= selected.period_end && date(p.assumptions_as_of) && selected.period_end <= p.assumptions_as_of, "preview dates");
    requireCase(sameJson(p.selected_period, a.selected_period) && p.assumptions_as_of === a.assumptions_as_of && sameJson(p.policy_snapshot, a.policy_snapshot), "baseline period and retained policy");
    const input = object(a.normalized_input, "baseline input");
    requireCase(sameJson(p.units, input.units), "baseline units");
    requireCase(array(p.held_fixed_assumptions, "held fixed assumptions").length > 0 && (p.held_fixed_assumptions as unknown[]).every(text) && text(p.disclaimer), "preview explanation");
    previewCommand(p);
    return { b, a };
}
export function guardPreview(value: unknown, view?: StoredCase, command?: PreviewCommand): ScenarioPreview {
    const p = object(value, "scenario preview");
    finiteJson(p, 0, 100);
    const { b, a } = baselineEnvelope(p);
    requireCase(p.scenario_definition_version === "commercial-scenario-definition-v1" && p.calculation_version === "commercial-calculation-v1", "supported live scenario definition");
    const baseline = guardAssessment(a);
    if (view)
        requireCase(b.case_id === view.snapshot.case_id && b.revision === view.snapshot.revision && b.run_id === view.snapshot.run_id && b.input_hash === view.snapshot.input_hash && b.payload_hash === view.snapshot.payload_hash && sameJson(baseline, view.snapshot.assessment), "selected original baseline");
    if (command)
        requireCase(sameJson(previewCommand(p), guardScenarioCommand(command)), "reviewed normalized command");
    for (const value of p.scenarios as unknown[])
        guardResult(value, p, baseline);
    return p as ScenarioPreview;
}
function guardResult(value: unknown, p: Obj, baseline: Assessment) {
    const s = object(value, "scenario result"), normalized = normalizedScenario(s);
    requireCase(sameJson({ scenario_key: s.scenario_key, name: s.name, rationale: s.rationale, assumptions: s.assumptions }, normalized) && s.coverage_basis === "stressed_latest_period_current_pro_forma", "normalized projection command/basis");
    const input = object(s.projection_inputs, "projected inputs"), observed = baseline.normalized_input;
    guardDatedInput({ ...observed, years: [...observed.years.slice(0, -1), input.operating], proposed_loan: input.proposed_loan, existing_debt: input.existing_debt, guarantors: input.guarantors, working_capital: input.working_capital });
    for (const k of ["existing_debt", "guarantors", "working_capital"] as const)
        requireCase(sameJson(input[k], observed[k]), "held-fixed projected inputs");
    const operating = object(input.operating, "projected operating"), loan = object(input.proposed_loan, "projected loan"), latest = observed.years[observed.years.length - 1];
    for (const k of annualFields)
        if (!["gross_receipts", "cogs", "operating_expense_excl_dna_interest_comp"].includes(k))
            requireCase(operating[k] === latest[k], "held-fixed financial lines");
    requireCase(operating.period_start === latest.period_start && operating.period_end === latest.period_end, "projected period");
    for (const k of Object.keys(observed.proposed_loan))
        if (k !== "annual_rate")
            requireCase(loan[k] === observed.proposed_loan[k as keyof DatedRequest["proposed_loan"]], "held-fixed loan");
    const facts = object(s.current_facts, "projected facts"), metrics: Metric[] = [];
    for (const k of currentFactKeys) {
        const m = metric(facts[k]), held = k === "k1_history" || k === "k1_ratio_difference";
        const factId = held ? "baseline." + baseline.current_facts[k].fact_id : ["ordinary_business_income", "ebitda"].includes(k) ? `projection.operating.${k}` : `projection.current.${k}`;
        requireCase(m.fact_id === factId && (held ? sameJson(m, { ...baseline.current_facts[k], fact_id: factId }) : nullableNumber(m.raw_value)), "projected fact identity/type/observed history");
        metrics.push(m);
    }
    const contributions = array(s.guarantor_contributions, "projected guarantors");
    requireCase(contributions.length === observed.guarantors.length, "guarantor count");
    contributions.forEach((v, i) => { const g = object(v, "guarantor contribution"); requireCase(g.guarantor_index === i && g.name === observed.guarantors[i].name, "guarantor identity"); for (const k of ["business_ebitda", "outside_income", "personal_debt"]) {
        const m = metric(g[k]);
        requireCase(m.fact_id === `projection.current.guarantors.${i}.${k}` && nullableNumber(m.raw_value), "projected guarantor fact");
        metrics.push(m);
    } });
    const decision = guardDecision(s.decision);
    requireCase(decision.policy_version === baseline.policy_snapshot.version, "retained decision policy");
    const rows = array(s.calculation_trace, "projection trace"), trace = new Map<string, Metric>();
    for (const v of rows) {
        const row = object(v, "trace row"), m = metric(row);
        requireCase(text(row.definition_id) && text(row.expression) && !trace.has(m.fact_id), "trace identity");
        trace.set(m.fact_id, m);
        array(row.operands, "trace operands");
    }
    for (const original of baseline.calculation_trace) {
        const expected = { ...original, fact_id: "baseline." + original.fact_id, operands: original.operands.map(operand => ({ ...operand, reference: operand.reference_type === "fact" ? "baseline." + operand.reference : operand.reference_type === "input" ? "/baseline/assessment/normalized_input" + operand.reference : operand.reference })) };
        requireCase(sameJson(trace.get(expected.fact_id), expected), "retained observed trace identity");
    }
    for (const v of rows)
        for (const raw of object(v, "trace row").operands as unknown[]) {
            const o = object(raw, "operand");
            requireCase(text(o.reference) && text(o.unit) && (o.raw_value === null || finite(o.raw_value) || text(o.raw_value)), "operand value");
            if (o.reference_type === "fact") {
                const linked = trace.get(o.reference);
                requireCase(linked && linked.raw_value === o.raw_value && linked.unit === o.unit, "referenced scenario fact");
            }
            else {
                requireCase(["input", "policy"].includes(String(o.reference_type)) && o.reference.startsWith("/"), "operand reference");
                let linked: unknown = { ...s, baseline: p.baseline, policy_snapshot: p.policy_snapshot };
                for (const part of o.reference.slice(1).split("/")) {
                    const obj = objectOrArray(linked);
                    requireCase(Object.prototype.hasOwnProperty.call(obj, part), "scenario operand path");
                    linked = obj[part];
                }
                requireCase(linked === o.raw_value, "scenario operand value");
            }
        }
    for (const m of metrics) {
        const linked = trace.get(m.fact_id);
        requireCase(linked && ["fact_id", "raw_value", "unit", "display_precision", "status", "explanation"].every(k => (linked as unknown as Obj)[k] === (m as unknown as Obj)[k]), "fact/trace fields");
    }
    // Trace rows include definition/operands; compare just the Metric display fields.
    const comparisons = array(s.comparisons, "metric comparisons");
    requireCase(comparisons.length === currentFactKeys.length - 1, "comparison count");
    const seen = new Set<string>();
    for (const v of comparisons) {
        const c = object(v, "metric comparison");
        requireCase(text(c.metric) && currentFactKeys.includes(c.metric as typeof currentFactKeys[number]) && c.metric !== "k1_history" && !seen.has(c.metric), "compared metric identity");
        seen.add(c.metric);
        const old = baseline.current_facts[c.metric as keyof Assessment["current_facts"]], now = metric(facts[c.metric]);
        requireCase(c.baseline_fact_id === "baseline." + old.fact_id && c.projected_fact_id === now.fact_id && c.baseline_value === old.raw_value && c.projected_value === now.raw_value && c.unit === now.unit && nullableNumber(c.delta), "comparison fact links");
        requireCase((old.raw_value === null || now.raw_value === null) ? c.delta === null && text(c.delta_explanation) : finite(c.delta) && c.delta_explanation === null, "comparison availability");
        const factor = decision.factors.find(f => f.name === (c.metric === "uca_cash_flow" ? "uca_positive" : c.metric));
        if (["dscr", "fccr", "global_dscr", "uca_cash_flow"].includes(c.metric)) {
            const h = object(c.policy_headroom, "policy headroom");
            requireCase(factor && h.comparison_operator === factor.comparison_operator && h.approval_threshold === factor.threshold && h.decline_threshold === factor.decline_threshold, "headroom policy");
            for (const k of ["baseline_approval", "projected_approval", "baseline_decline", "projected_decline"])
                requireCase(nullableNumber(h[k]), "finite headroom");
        }
        else
            requireCase(c.policy_headroom === null, "non-policy headroom");
    }
    for (const factor of decision.factors) {
        const k = factor.name === "uca_positive" ? "uca_cash_flow" : factor.name, retained = baseline.decision.factors.find(value => value.name === factor.name);
        requireCase(factor.raw_value === metric(facts[k]).raw_value && retained && ["threshold", "decline_threshold", "comparison_operator", "weight", "source"].every(key => (factor as unknown as Obj)[key] === (retained as unknown as Obj)[key]), "scenario factor fact and retained policy");
        if (k === "k1_history")
            requireCase(sameJson(factor, retained), "held-fixed observed K-1 factor");
    }
    const changes = array(s.factor_changes, "factor changes");
    requireCase(changes.length === decision.factors.length, "factor change count");
    const names = new Set<string>();
    for (const v of changes) {
        const c = object(v, "factor change"), old = baseline.decision.factors.find(f => f.name === c.name), now = decision.factors.find(f => f.name === c.name);
        requireCase(text(c.name) && !names.has(c.name) && old && now && sameJson(c.baseline, old) && sameJson(c.projected, now) && c.changed === !sameJson(old, now) && c.basis === (c.name === "k1_history" ? "observed_history" : "projected_current"), "factor change links");
        names.add(c.name);
        requireCase(c.projected_fact_id === metric(facts[c.name === "uca_positive" ? "uca_cash_flow" : c.name]).fact_id, "factor projected reference");
    }
    const outcome = object(s.outcome_change, "outcome change");
    requireCase(outcome.baseline === baseline.decision.outcome && outcome.projected === decision.outcome && outcome.changed === (outcome.baseline !== outcome.projected), "outcome change links");
    const reasons = array(s.reason_changes, "reason changes"), expected = Array.from(new Set([...baseline.decision.reasons, ...decision.reasons].map(r => r.code))).filter(code => !sameJson(baseline.decision.reasons.find(r => r.code === code) ?? null, decision.reasons.find(r => r.code === code) ?? null));
    requireCase(reasons.length === expected.length, "reason changes count");
    const codes = new Set<string>();
    for (const v of reasons) {
        const r = object(v, "reason change"), old = baseline.decision.reasons.find(x => x.code === r.code) ?? null, now = decision.reasons.find(x => x.code === r.code) ?? null;
        requireCase(text(r.code) && expected.includes(r.code) && !codes.has(r.code) && sameJson(r.baseline, old) && sameJson(r.projected, now) && r.change === (old === null ? "added" : now === null ? "removed" : "changed"), "reason change links");
        codes.add(r.code);
    }
}
function objectOrArray(value: unknown): Obj { requireCase(value !== null && typeof value === "object", "operand path object"); return value as Obj; }
export function guardComparison(value: unknown, etag: string | null): StoredComparison {
    const r = object(value, "original comparison");
    finiteJson(r, 0, 100);
    requireCase(r.schema_version === "commercial-scenario-comparison-v1" && r.storage_serialization_version === "scenario-comparison-json-v1" && r.persisted === true && canonicalId(r.comparison_id) && canonicalId(r.case_id) && canonicalId(r.baseline_run_id) && revision(r.baseline_revision) && hash(r.payload_hash), "comparison storage identity");
    requireCase(timestamp(r.recorded_at) && /^\d{4}-\d\d-\d\dT(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d\.\d{6}\+00:00$/.test(r.recorded_at) && r.actor === "prototype-demo-unverified", "comparison recording time/actor");
    guardRecording(r.recording);
    requireCase(etag === `"scenario-comparison-json-v1:${r.case_id}:${r.comparison_id}:${r.payload_hash}"`, "comparison ETag");
    const p = object(r.preview, "original preview"), { b, a } = baselineEnvelope(p);
    requireCase(b.case_id === r.case_id && b.revision === r.baseline_revision && b.run_id === r.baseline_run_id, "inner/outer original baseline");
    const known = p.scenario_definition_version === "commercial-scenario-definition-v1" && p.calculation_version === "commercial-calculation-v1" && a.schema_version === "commercial-assessment-v1" && a.calculation_version === "commercial-calculation-v1" && a.serialization_version === "assessment-json-v1";
    return { record: r as ComparisonRecord, etag: etag!, preview: known ? guardPreview(p) : null, compatibility: known ? null : `Original definition: ${p.scenario_definition_version} / ${p.calculation_version}; baseline ${a.schema_version} / ${a.calculation_version} / ${a.serialization_version}. Original JSON remains available; typed projection and new preview are unavailable.` };
}
export function guardComparisonPage(value: unknown, caseId: string): Page<ComparisonSummary> {
    const p = object(value, "comparison page");
    finiteJson(p, 0, 100);
    const items = array(p.items, "comparison summaries");
    requireCase(items.length <= 25 && (p.next_cursor === null || (text(p.next_cursor) && /^[A-Za-z0-9_-]{1,512}$/.test(p.next_cursor))), "bounded comparison page/cursor");
    const ids = new Set<string>();
    for (const v of items) {
        const s = object(v, "comparison summary");
        requireCase(s.case_id === caseId && canonicalId(s.comparison_id) && canonicalId(s.baseline_run_id) && revision(s.baseline_revision) && timestamp(s.recorded_at) && hash(s.preview_fingerprint) && !ids.has(String(s.comparison_id)), "summary identity");
        ids.add(String(s.comparison_id));
        requireCase(s.schema_version === "commercial-scenario-comparison-v1" && s.storage_serialization_version === "scenario-comparison-json-v1" && s.preview_schema_version === schema && s.preview_serialization_version === serialization && text(s.policy_version) && text(s.scenario_definition_version) && text(s.calculation_version), "summary versions");
        const rows = array(s.scenarios, "scenario summaries"), keys = new Set<string>();
        requireCase(rows.length >= 1 && rows.length <= 10 && s.scenario_count === rows.length, "scenario count");
        for (const v of rows) {
            const r = object(v, "scenario summary");
            requireCase(text(r.scenario_key) && /^[A-Za-z0-9_-]{1,64}$/.test(r.scenario_key) && !keys.has(r.scenario_key) && scenarioText(r.name, 120) === r.name, "summary command");
            keys.add(r.scenario_key);
        }
    }
    return p as Page<ComparisonSummary>;
}
