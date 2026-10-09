import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { currentFactKeys, type Metric, type Trace } from "./contracts";
import { metricText } from "./metricDisplay";
import { usePages } from "./SavedCases";
import { fetchComparisons } from "./scenarioApi";
import { shockKeys, type ComparisonSummary, type ScenarioPreview, type ScenarioResult, type StoredComparison } from "./scenarioContracts";
import { presets, type useScenarioWorkspace } from "./useScenarioWorkspace";
import type { Locator } from "./caseRecovery";
const labels: Record<string, string> = {
    ordinary_business_income: "Ordinary business income", ebitda: "EBITDA", proposed_monthly_payment: "Proposed monthly payment",
    proposed_annual_payment: "Proposed annual payment", debt_service: "Business debt service", fixed_charge_service: "Fixed charge service",
    global_business_ebitda: "Owned business EBITDA", global_outside_income: "Outside income", global_personal_debt: "Personal debt",
    global_cash_flow: "Global cash flow", global_debt_service: "Global debt service", dscr: "DSCR", fccr: "Simplified FCCR",
    global_dscr: "Global DSCR", net_working_capital_increase: "Working capital increase", uca_cash_flow: "UCA cash flow",
    k1_ratio_difference: "Observed K-1 ratio difference", k1_history: "Observed K-1 history", uca_positive: "UCA positive",
};
const shockLabels = ["Revenue change (%)", "COGS change (%)", "Operating expense change (%)", "Proposed rate change (bps)"];
function Disclosure({ title, children }: {
    title: string;
    children: () => ReactNode;
}) {
    const [open, setOpen] = useState(false);
    return <details onToggle={event => setOpen(event.currentTarget.open)}><summary>{title}</summary>{open && children()}</details>;
}
function Pages<T>({ rows, render, label }: {
    rows: T[];
    render: (row: T, index: number) => ReactNode;
    label: string;
}) {
    const [page, setPage] = useState(0), count = Math.max(1, Math.ceil(rows.length / 50));
    return <div aria-label={label}>
    <p>Page {page + 1} of {count} · {rows.length} rows · up to 50 rows per page</p>
    {rows.slice(page * 50, (page + 1) * 50).map((value, index) => render(value, page * 50 + index))}
    {count > 1 && <div className="actions"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous {label} page</button>
      <button disabled={page + 1 === count} onClick={() => setPage(page + 1)}>Next {label} page</button></div>}
  </div>;
}
function OriginalJson({ value }: {
    value: unknown;
}) {
    const pages = useMemo(() => {
        const bytes = new TextEncoder().encode(JSON.stringify(value, null, 2)), result: string[] = [], decoder = new TextDecoder("utf-8", { fatal: true });
        for (let offset = 0; offset < bytes.length;) {
            let end = Math.min(offset + 65536, bytes.length);
            while (end < bytes.length && (bytes[end] & 0xc0) === 0x80)
                end--;
            result.push(decoder.decode(bytes.slice(offset, end)));
            offset = end;
        }
        return result;
    }, [value]);
    const [page, setPage] = useState(0);
    return <div className="originalComparisonJson"><p>Original JSON · page {page + 1} of {pages.length} · up to 64 KiB of UTF-8 text per page</p>
    <pre>{pages[page]}</pre><div className="actions"><button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous JSON page</button>
      <button disabled={page + 1 === pages.length} onClick={() => setPage(page + 1)}>Next JSON page</button></div></div>;
}
function TraceRow({ row }: {
    row: Trace;
}) {
    return <details><summary>{row.fact_id} · {metricText(row)}</summary><strong>{row.definition_id}</strong><p className="expression">{row.expression}</p>
    {row.operands.map((operand, index) => <div className="operand" key={index}><code>{operand.reference}</code><span>{operand.raw_value === null ? "Not applicable" : String(operand.raw_value)} {operand.unit}</span><small>{operand.reference_type}</small></div>)}
    {row.explanation && <p>{row.explanation}</p>}</details>;
}
function raw(value: number | string | boolean | null) { return value === null ? "Not applicable" : String(value); }
function headroom(value: number | null) { return value === null ? "Not applicable" : String(value); }
function Projection({ preview, result }: {
    preview: ScenarioPreview;
    result: ScenarioResult;
}) {
    const original = preview.baseline.assessment;
    return <article className="scenarioResult" aria-label={`Reviewed scenario ${result.name}`}>
    <h3>{result.name}</h3><p>{result.rationale}</p>
    <p className="scenarioOutcome">Baseline <strong data-outcome={result.outcome_change.baseline}>{result.outcome_change.baseline.toUpperCase()}</strong> → Projected <strong data-outcome={result.outcome_change.projected}>{result.outcome_change.projected.toUpperCase()}</strong> · {result.outcome_change.changed ? "Outcome changed" : "Outcome unchanged"}</p>
    <p>Server score {result.decision.score} · retained policy {result.decision.policy_version}</p>
    <div className="tableScroll"><table><caption>Original baseline and projected current facts</caption><thead><tr><th>Metric</th><th>Baseline</th><th>Projected</th><th>Server delta</th></tr></thead><tbody>
      {currentFactKeys.map(key => {
            const comparison = result.comparisons.find(value => value.metric === key);
            return <tr key={key}><th scope="row">{labels[key]}</th><td className="num">{metricText(original.current_facts[key])}</td><td className="num">{metricText(result.current_facts[key])}</td>
          <td className="num">{comparison ? comparison.delta === null ? "Not applicable" : metricText({ ...result.current_facts[key], raw_value: comparison.delta }) : "Held fixed"}
            {comparison?.delta_explanation && <small>{comparison.delta_explanation}</small>}</td></tr>;
        })}
    </tbody></table></div>
    <p>K-1 history stays observed: {metricText(result.current_facts.k1_history)}. Current shocks do not create a historical operating year.</p>
    <Disclosure title="Raw deltas and policy headroom">{() => <div>
      <p>Values below are the server's raw results. Approval uses the displayed operator; decline floors apply where returned.</p>
      {result.comparisons.map(value => <div className="scenarioFact" key={value.metric}><strong>{labels[value.metric]}</strong>
        <p>Baseline {raw(value.baseline_value)} · projected {raw(value.projected_value)} · delta {raw(value.delta)} {value.unit}</p>
        <code>{value.baseline_fact_id} → {value.projected_fact_id}</code>
        {value.delta_explanation && <p>{value.delta_explanation}</p>}
        {value.policy_headroom && <p>Approval {value.policy_headroom.comparison_operator} {raw(value.policy_headroom.approval_threshold)} · decline floor {raw(value.policy_headroom.decline_threshold)}<br />
          Approval headroom: baseline {headroom(value.policy_headroom.baseline_approval)} · projected {headroom(value.policy_headroom.projected_approval)}<br />
          Decline headroom: baseline {headroom(value.policy_headroom.baseline_decline)} · projected {headroom(value.policy_headroom.projected_decline)}</p>}
      </div>)}
    </div>}</Disclosure>
    <Disclosure title="Factor and reason changes">{() => <div>
      {result.factor_changes.map(change => <div className="scenarioFact" key={change.name}><h4>{labels[change.name]} · {change.changed ? "Changed" : "Unchanged"}</h4>
        <p>Baseline raw {raw(change.baseline.raw_value)} → projected raw {raw(change.projected.raw_value)}<br />
          Pass: {raw(change.baseline.passed)} → {raw(change.projected.passed)} · decline triggered: {raw(change.baseline.decline_triggered)} → {raw(change.projected.decline_triggered)}<br />
          Operator {change.projected.comparison_operator ?? "Not applicable"} · approval {raw(change.projected.threshold)} · decline floor {raw(change.projected.decline_threshold)} · weight {change.projected.weight}<br />
          Basis {change.basis} · <code>{change.projected_fact_id}</code></p></div>)}
      <h4>Reason changes</h4>{result.reason_changes.length ? result.reason_changes.map(value => <div key={value.code}><strong>{value.code} · {value.change}</strong><p>Baseline: {value.baseline?.message ?? "No reason"}<br />Projected: {value.projected?.message ?? "No reason"}</p></div>) : <p>No reason changes returned.</p>}
      <h4>Projected reasons</h4>{result.decision.reasons.length ? result.decision.reasons.map(value => <p key={value.code}>{value.code} · {value.message}</p>) : <p>No additional reasons returned.</p>}
    </div>}</Disclosure>
    <Disclosure title="Projected inputs and held-fixed assumptions">{() => <div>
      <pre>{JSON.stringify({ assumptions: result.assumptions, operating: result.projection_inputs.operating, proposed_loan: result.projection_inputs.proposed_loan,
                existing_debt: result.projection_inputs.existing_debt, working_capital: result.projection_inputs.working_capital }, null, 2)}</pre>
      <ul>{preview.held_fixed_assumptions.map((value, index) => <li key={index}>{value}</li>)}</ul>
    </div>}</Disclosure>
    <Disclosure title="Projected guarantor contributions">{() => <Pages rows={result.guarantor_contributions} label="guarantors" render={(value, index) => <div className="scenarioFact" key={index}><h4>{value.name}</h4>
      <p>Business EBITDA: {metricText(value.business_ebitda)}<br />Outside income: {metricText(value.outside_income)}<br />Personal debt: {metricText(value.personal_debt)}</p>
      <Disclosure title={`${value.name} projected inputs`}>{() => <pre>{JSON.stringify(result.projection_inputs.guarantors[index], null, 2)}</pre>}</Disclosure></div>}/>}</Disclosure>
    <Disclosure title="Calculation trace">{() => <Pages rows={result.calculation_trace} label="trace" render={value => <TraceRow key={value.fact_id} row={value}/>}/>}</Disclosure>
  </article>;
}
function Results({ preview }: {
    preview: ScenarioPreview;
}) {
    const [index, setIndex] = useState(0);
    return <div><label className="scenarioSelect">Reviewed scenario <select aria-label="Reviewed scenario" value={index} onChange={event => setIndex(Number(event.target.value))}>
    {preview.scenarios.map((value, i) => <option value={i} key={value.scenario_key}>{i + 1}. {value.name}</option>)}</select></label>
    <Projection key={preview.scenarios[index].scenario_key} preview={preview} result={preview.scenarios[index]}/>
    <p className="fine">{preview.disclaimer}</p></div>;
}
function Original({ view, onOpen }: {
    view: StoredComparison;
    onOpen: (locator: Locator) => void;
}) {
    const record = view.record;
    return <section className="panel originalComparison">
    <div className="comparisonContext"><h2>Saved comparison</h2><code>{record.comparison_id}</code><p>Original record · Case {record.case_id} · baseline revision {record.baseline_revision}<br />Run {record.baseline_run_id} · recorded {record.recorded_at}</p>
      <button onClick={() => onOpen({ caseId: record.case_id, revision: record.baseline_revision })}>Open baseline revision</button></div>
    <p>Recording actor: unverified prototype demonstration · source status {record.recording.source_status}{record.recording.source_revision ? ` · ${record.recording.source_revision}` : " · exact build revision not supplied"}</p>
    {view.preview ? <><p>Operating period {view.preview.selected_period.period_start} – {view.preview.selected_period.period_end} · assumptions as of {view.preview.assumptions_as_of}<br />Retained policy {view.preview.policy_snapshot.version} · {view.preview.scenario_definition_version} · {view.preview.calculation_version}</p>
      <Disclosure title="Baseline hashes, fingerprint and retained policy">{() => <div><p>Input hash <code>{view.preview!.baseline.input_hash}</code><br/>Baseline payload hash <code>{view.preview!.baseline.payload_hash}</code><br/>Reviewed fingerprint <code>{view.preview!.fingerprint.value}</code></p><pre>{JSON.stringify({ units: view.preview!.units, policy_snapshot: view.preview!.policy_snapshot, recording: record.recording }, null, 2)}</pre></div>}</Disclosure>
      <Results key={record.comparison_id} preview={view.preview}/></> : <p className="compatibility" role="status">{view.compatibility}</p>}
    <Disclosure title="Original comparison JSON">{() => <OriginalJson value={record}/>}</Disclosure>
    <p className="fine">Payload hash {record.payload_hash}. These local consistency identifiers do not authenticate documents or people.</p>
  </section>;
}
function Archive({ caseId, scope, refresh, onOpen }: {
    caseId: string;
    scope: string;
    refresh: number;
    onOpen: (comparisonId: string) => void;
}) {
    const pages = usePages<ComparisonSummary>(`${scope}:${refresh}`, (after, signal) => fetchComparisons(caseId, after, signal), value => value.comparison_id);
    return <section className="panel comparisonArchive" aria-label="Saved comparisons"><div className="panelTitle"><div><h2>Saved comparisons</h2><p>All baselines for this case · newest records first · 25 summaries per page</p></div><button onClick={pages.refresh}>Refresh comparisons</button></div>
    {pages.loading && <p role="status">Loading comparison summaries…</p>}{pages.error && <p role="alert">{pages.error}</p>}
    {!pages.loading && !pages.error && !pages.items.length && <p>No saved comparisons yet.</p>}
    {pages.items.map(value => <article className="caseRow" key={value.comparison_id}><div><h3>{value.scenarios.map(scenario => scenario.name).join(" · ")}</h3><code>{value.comparison_id}</code><p>Baseline revision {value.baseline_revision} · {value.scenario_count} scenario(s)<br />{value.recorded_at} · policy {value.policy_version}</p></div>
      <button aria-label={`Open comparison ${value.comparison_id}`} onClick={() => onOpen(value.comparison_id)}>Open original comparison</button></article>)}
    {pages.next && <button disabled={pages.loading} onClick={pages.more}>Load more comparisons</button>}
  </section>;
}
export function Scenarios({ model, onSaveBaseline, onOpenBaseline }: {
    model: ReturnType<typeof useScenarioWorkspace>;
    onSaveBaseline: (element: HTMLElement) => void;
    onOpenBaseline: (locator: Locator) => void;
}) {
    const addButton = useRef<HTMLButtonElement>(null);
    const [focusKey, setFocusKey] = useState<string | null>(null);
    useEffect(() => {
        if (!focusKey)
            return;
        document.getElementById(`scenario-name-${focusKey}`)?.focus();
        setFocusKey(null);
    }, [focusKey]);
    const isDated = model.view?.assessment;
    return <div className="scenariosWorkspace">
    <section className="panel scenarioComposer" aria-label="Scenario authoring"><div className="panelTitle"><div><h2>Scenario comparison</h2><p>Review current pro forma shocks against an explicit original saved baseline.</p></div></div>
      {model.baseline && <p>Case <code>{model.baseline.case_id}</code> · baseline revision {model.baseline.revision}<br />Run <code>{model.baseline.run_id}</code><br />Payload hash <code>{model.baseline.payload_hash}</code></p>}
      {isDated && <p>Operating period {isDated.selected_period.period_start} – {isDated.selected_period.period_end} · assumptions as of {isDated.assumptions_as_of}<br />Retained policy {isDated.policy_snapshot.version}. The spread's selected column does not change this baseline.</p>}
      {!model.view ? <><p>Save an accepted dated case, or open an original saved revision, to author scenarios. Legacy annual assessments remain unsaved.</p><button disabled={!model.canSaveBaseline} onClick={event => onSaveBaseline(event.currentTarget)}>Save baseline case</button></> : !model.supported ? <p>New preview is unavailable for this baseline definition. Saved comparison summaries and original records remain available below.</p> : <>
        <p>Enter percentage changes as percentages (−10 means −10%). Enter rate changes in basis points; fractional basis points are supported. Each of the four shocks must be explicit. Presets fill the name and shocks; enter your own rationale.</p>
        {model.rows.map((value, index) => <fieldset className="scenarioRow" key={value.key} disabled={model.fieldsDisabled}><legend>Scenario {index + 1}</legend><div className="scenarioFields">
          <label>Preset<select aria-label={`Scenario ${index + 1} preset`} value={value.preset} onChange={event => model.preset(value.key, event.target.value)}><option value="custom">Custom / zero shocks</option>{Object.entries(presets).map(([key, preset]) => <option key={key} value={key}>{preset.name}</option>)}</select></label>
          <label>Name<input id={`scenario-name-${value.key}`} aria-label={`Scenario ${index + 1} name`} value={value.name} onChange={event => model.change(value.key, row => ({ ...row, name: event.target.value }))}/></label>
          <label className="scenarioRationale">Rationale<textarea aria-label={`Scenario ${index + 1} rationale`} rows={3} value={value.rationale} onChange={event => model.change(value.key, row => ({ ...row, rationale: event.target.value }))}/><small>Required · at most 2,000 Unicode characters after trimming; name limit 120.</small></label>
          {shockKeys.map((key, i) => <label key={key}>{shockLabels[i]}<input inputMode="decimal" aria-label={`Scenario ${index + 1} ${shockLabels[i]}`} value={value.shocks[key]} onChange={event => model.change(value.key, row => ({ ...row, preset: "custom", shocks: { ...row.shocks, [key]: event.target.value } }))}/></label>)}
        </div><button disabled={model.rows.length <= 1} aria-label={`Remove scenario ${index + 1}`} onClick={() => { model.remove(value.key); addButton.current?.focus(); }}>Remove scenario</button></fieldset>)}
        <div className="actions"><button ref={addButton} disabled={model.fieldsDisabled || model.rows.length >= 10} onClick={() => { const key = model.add(); if (key)
            setFocusKey(key); }}>Add scenario</button>
          <button disabled={model.fieldsDisabled || model.busy || !model.rows.length} onClick={() => void model.preview()}>Preview scenarios</button>
          <button className="primary" disabled={!model.canRetain} onClick={model.retain}>Save reviewed comparison</button>
          <button disabled={model.frozen} onClick={model.newDraft}>Start another comparison</button></div>
        <p role="status">{model.busy ? "Previewing current draft…" : model.canRetain ? "Current preview ready for review and retention." : "Preview required before a fresh save. A saved or pending batch cannot be saved twice."}</p>
        {model.original.view && <p>Viewing a saved original. Choose Start another comparison to author a fresh batch.</p>}
        {model.writeBlocked && <p>Resolve this tab's existing saved write, recovery tracking or conflicting proposal before retaining another comparison. Read-only previews remain available.</p>}
      </>}
      {model.error && <p role="alert">{model.error}</p>}
      {model.errorCode === "storage_upgrade_required" && <p>Retention requires the documented copy upgrade to a separate schema-v2 database. An operator must verify the copy and select it explicitly; opening this view performs no upgrade. See <code>docs/SCENARIO_COMPARISONS.md</code>.</p>}
    </section>
    {model.previewResult && (!model.original.view || !model.previewConsumed) && <section className="panel scenarioPreview"><h2>Read-only preview</h2><p>Review the server's projected results and rationale before saving this batch.<br/>Reviewed fingerprint <code>{model.previewResult.fingerprint.value}</code></p><Results key={model.previewResult.fingerprint.value} preview={model.previewResult}/></section>}
    {model.original.loading && <p role="status">Loading original comparison…</p>}{model.original.error && <p role="alert">{model.original.error}</p>}
    {model.original.view && (!model.previewResult || model.previewConsumed) && <Original view={model.original.view} onOpen={onOpenBaseline}/>}
    {model.baseline && <Archive caseId={model.baseline.case_id} scope={model.context} refresh={model.refreshSerial} onOpen={id => void model.open(id)}/>}
  </div>;
}
