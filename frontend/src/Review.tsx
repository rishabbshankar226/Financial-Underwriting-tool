import { useState } from "react";
import { comparisonMatches, reviewFilename } from "./reviewPackage";
import { useReviewDownload } from "./useReviewDownload";
import { metricText } from "./metricDisplay";
import { prototypeDisclaimer } from "./prototypeDisclaimer";
import type { StoredCase } from "./caseContracts";
import type { Locator } from "./caseRecovery";
import type { useScenarioWorkspace } from "./useScenarioWorkspace";

function short(value: unknown): string {
  return typeof value === "string" ? value.length > 240 ? `${value.slice(0, 240)}…` : value : "Unavailable";
}
export function Review({ view, selection, headRevision, sourceScope, original, pending, onOpenBaseline }: {
  view: StoredCase | null;
  selection: string | null;
  headRevision: number | null;
  sourceScope: string;
  original: ReturnType<typeof useScenarioWorkspace>["original"];
  pending: boolean;
  onOpenBaseline: (locator: Locator) => void;
}) {
  const comparison = original.loading || original.error ? null : original.view;
  const source = `${sourceScope}:${view?.etag ?? ""}:${original.context}:${original.loading}:${comparison?.etag ?? ""}:${original.error}`;
  const [choice, setChoice] = useState({ source, included: false });
  const included = choice.source === source && choice.included;
  const download = useReviewDownload(`${source}:${included}`);
  let matches = false;
  if (view && comparison) { try { comparisonMatches(view, comparison); matches = true; } catch { /* Explicit baseline navigation is offered below. */ } }
  const assessment = view?.assessment, s = view?.snapshot, r = comparison?.record;
  const scenarioCount = comparison?.preview?.scenarios.length ?? (Array.isArray(r?.preview.scenarios) ? r.preview.scenarios.length : 0);
  return <div className="reviewWorkspace">
    <section className="panel reviewIdentity">
      <p className="eyebrow">ORIGINAL RECORD · REVIEW PACKAGE</p>
      <h2>Saved-run review</h2>
      {s ? <>
        <h3>{short(s.normalized_input.borrower_name)}</h3>
        <dl className="reviewFacts">
          <div><dt>Case</dt><dd>{s.case_id}</dd></div><div><dt>Selected revision / run</dt><dd>{s.revision} / {s.run_id}</dd></div>
          <div><dt>Recorded at</dt><dd>{s.recorded_at}</dd></div>
          <div><dt>Selection</dt><dd>{selection === "latest" ? "Latest when fetched" : "Original selected revision"}{headRevision !== null ? ` · known head ${headRevision}` : " · current head not confirmed"}</dd></div>
          <div><dt>Financial definitions</dt><dd>{short(s.assessment.schema_version)} / {short(s.assessment.calculation_version)} / {short(s.assessment.serialization_version)}</dd></div>
          <div><dt>Recording</dt><dd>Actor: prototype demo, unverified · {s.recording.source_status === "build_reported" ? "build revision reported, unverified" : "development build, unverified"}</dd></div>
        </dl>
        {assessment ? <>
          <p>Operating period: {assessment.selected_period.period_start} – {assessment.selected_period.period_end} · assumptions as of {assessment.assumptions_as_of} · USD dollars.</p>
          <p>Original outcome: <strong>{assessment.decision.outcome.toUpperCase()}</strong> · policy {short(assessment.policy_snapshot.version)}. Current pro forma coverage; observed history remains separate.</p>
          <div className="reviewMetrics">{([
            ["EBITDA", assessment.current_facts.ebitda], ["UCA cash flow", assessment.current_facts.uca_cash_flow],
            ["DSCR", assessment.current_facts.dscr], ["FCCR", assessment.current_facts.fccr],
            ["Global DSCR", assessment.current_facts.global_dscr], ["Observed K-1 history", assessment.current_facts.k1_history],
          ] as const).map(([label, metric]) => <div key={label}><span>{label}</span><strong>{metricText(metric)}</strong>{metric.explanation && <small>{short(metric.explanation)}</small>}</div>)}</div>
          <p>Recorded reasons: {assessment.decision.reasons.length}. Inspect factors and calculations in the existing Details and Memo views.</p>
        </> : <p className="warning">Original JSON only. These financial definitions are not supported for typed conclusions. The guarded original can still be downloaded.</p>}
      </> : <p>Save or open a dated commercial revision to review and export its original evidence. Unsaved inputs, legacy decisions and incomplete case transitions cannot supply this package.</p>}
    </section>
    <section className="panel reviewComparison">
      <h2>Retained comparison</h2>
      {original.loading ? <p role="status">Loading the selected original comparison…</p> : original.error ? <p role="alert">{original.error}</p> : r ? <>
        <dl className="reviewFacts"><div><dt>Comparison</dt><dd>{r.comparison_id}</dd></div><div><dt>Baseline revision / run</dt><dd>{r.baseline_revision} / {r.baseline_run_id}</dd></div><div><dt>Recorded at</dt><dd>{r.recorded_at}</dd></div></dl>
        <p>Full retained batch: {scenarioCount} {scenarioCount === 1 ? "scenario" : "scenarios"} in original order.</p>
        <ul>{(comparison?.preview?.scenarios ?? r.preview.scenarios as { name: string }[]).map((scenario, i) => <li key={i}>{short(scenario.name)}</li>)}</ul>
        <p className="reviewHash">Preview fingerprint: {short((r.preview.fingerprint as { value?: string })?.value)}</p>
        {comparison?.compatibility && <p className="warning">Original JSON only for this comparison; typed projections are unavailable.</p>}
        {!matches && <p className="warning">This retained comparison has a different original baseline. Open that explicit revision to match its evidence before inclusion.</p>}
        {!matches && s && r.case_id === s.case_id && <button onClick={() => onOpenBaseline({ caseId: r.case_id, revision: r.baseline_revision })}>Open comparison baseline revision</button>}
      </> : <p>Open a retained original in Scenarios to include its full batch. A live preview or pending save is excluded.</p>}
      <label className="reviewInclude"><input type="checkbox" checked={included} disabled={!view || !matches || original.loading}
        onChange={event => setChoice({ source, included: event.target.checked })}/>Include this retained comparison</label>
    </section>
    <section className="panel reviewExport">
      <h2>JSON review package</h2>
      <p>Includes the full selected original: financial inputs, guarantor details, assessment, policy, trace, reasons, its revision event and recording metadata{included ? ", plus the full matching retained comparison batch" : ""}. This is one revision event, not the entire case history.</p>
      <p>Browser-parsed JSON representation; formatting and numeric spellings can differ from server bytes. Recorded hashes are carried unchanged, not verified by this export or calculated over the downloaded file.</p>
      {pending && <p className="warning">Pending work is excluded. Downloading this original leaves recovery tracking unchanged.</p>}
      <button disabled={!view || download.busy || (included && !matches)} onClick={() => { if (view) download.prepare(view, included ? comparison : null); }}>Download JSON review package</button>
      <p role="status">{download.busy && s ? `Preparing ${reviewFilename(s, included ? r ?? null : null)}…` : download.file ? `Prepared ${download.file.filename} (${download.file.size.toLocaleString("en-US")} bytes). The browser handles saving.` : "Maximum complete file: 16 MiB. No evidence is truncated."}</p>
      {download.error && <p role="alert">{download.error}</p>}
      {download.file && <a className="reviewDownload" href={download.file.url} download={download.file.filename}>Download prepared JSON</a>}
      <p className="fine">{prototypeDisclaimer}</p>
    </section>
  </div>;
}
