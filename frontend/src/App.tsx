import { useEffect, useRef, useState } from 'react';
import alpine from '../../backend/fixtures/alpine.json';

type Audit = { field: string; prior_value: unknown; new_value: unknown; rationale: string; source: string; actor: string; at: string };
type Request = Omit<typeof alpine, 'overrides'> & { overrides?: Audit[] };
type Factor = { name: string; value: number | string | boolean; threshold: number | string | boolean; passed: boolean | null; source: string };
type Decision = { outcome: 'approve' | 'review' | 'decline'; factors: Factor[]; reasons: { code: string; message: string }[]; disclaimer: string };
const disclaimer = 'Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.';
const lines = [
  { key: 'gross_receipts', label: 'Gross receipts', source: '1120-S L1' },
  { key: 'cogs', label: 'COGS', source: '1120-S L2' },
  { key: 'interest_expense', label: 'Interest expense', source: '1120-S L13' },
  { key: 'depreciation', label: 'Depreciation', source: 'Synthetic add-back' },
] as const;
const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const money = (value: number) => value.toLocaleString('en-US', { maximumFractionDigits: 2 });
const labels: Record<string, string> = { dscr: 'DSCR', fccr: 'FCCR', global_dscr: 'Global DSCR', uca_positive: 'UCA cash flow', k1_history: 'K-1 distribution history' };
function display(factor: Factor): string {
  if (typeof factor.value !== 'number') return String(factor.value);
  return factor.name === 'uca_positive' ? `$${money(factor.value)}` : `${factor.value.toFixed(3)}x`;
}
async function calculate(payload: unknown, signal: AbortSignal): Promise<Decision> {
  const response = await fetch(`${apiBase}/commercial/decision`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal,
  });
  const body = await response.json();
  if (!response.ok) {
    const detail = Array.isArray(body.detail) ? body.detail.map((item: { loc: string[]; msg: string }) => `${item.loc.join('.')}: ${item.msg}`).join('; ') : body.detail;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return body;
}

export default function App() {
  const [request, setRequest] = useState<Request>(alpine);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'spread' | 'memo' | 'audit'>('spread');
  const [fixture, setFixture] = useState('alpine.json');
  const active = useRef<AbortController | null>(null);
  const year = request.years[request.years.length - 1];
  const audit = request.overrides ?? [];

  async function evaluate(payload: unknown, filename?: string) {
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    setDecision(null); setError(''); setBusy(true);
    try {
      const result = await calculate(payload, controller.signal);
      if (controller.signal.aborted) return;
      if (filename) { setRequest(payload as Request); setFixture(filename); }
      setDecision(result);
    } catch (err) {
      if (!controller.signal.aborted) setError(`${filename ? 'Invalid fixture or unavailable backend' : 'Unable to calculate'}: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  useEffect(() => {
    void evaluate(alpine);
    return () => active.current?.abort();
  }, []);

  function edit(index: number) {
    if (busy) return;
    const line = lines[index];
    const prior = Number(year[line.key]);
    const raw = prompt('Override value', String(prior));
    if (raw === null) return;
    // Accept plain decimals or correctly grouped thousands; do not silently strip malformed commas.
    const valid = /^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?$/.test(raw.trim());
    const next = Number(raw.replace(/,/g, ''));
    if (!valid || !Number.isFinite(next)) { setError('Enter a valid finite number.'); return; }
    if (line.key === 'interest_expense' && next < 0) { setError('Interest expense cannot be negative.'); return; }
    if (next === prior) return;
    const rationale = prompt('Required rationale');
    if (rationale === null) return;
    if (!rationale.trim()) { setError('A nonblank rationale is required.'); return; }
    const updated: Request = {
      ...request,
      years: request.years.map((entry, i) => i === request.years.length - 1 ? { ...entry, [line.key]: next } : entry),
      overrides: [...audit, { field: line.key, prior_value: prior, new_value: next, rationale: rationale.trim(), source: 'human_override', actor: 'analyst', at: new Date().toISOString() }],
    };
    setRequest(updated);
    void evaluate(updated);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    if (file.size > 1_000_000) { setError('Invalid fixture: use a JSON file smaller than 1 MB.'); return; }
    try {
      const payload: unknown = JSON.parse(await file.text());
      await evaluate(payload, file.name);
    } catch {
      setError('Invalid fixture: select a complete commercial request in JSON format.');
    }
  }

  return <main>
    <header><div><div className="eyebrow">CREDIT WORKSPACE / SYNTHETIC</div><h1>{request.borrower_name}</h1><p>Commercial · Latest supplied period · Analyst-assisted</p></div><div className="decision" aria-live="polite"><span>Illustrative decision</span><strong>{busy ? 'CALCULATING' : decision?.outcome.toUpperCase() ?? 'UNAVAILABLE'}</strong><small>{decision ? 'Calculated from the current case and stored factors' : 'A current calculation is required'}</small></div></header>
    <div className="warning">{disclaimer}</div>
    <div className="uploadbar"><label>Import synthetic JSON <input type="file" accept=".json,application/json" disabled={busy} onChange={event => { void upload(event.target.files?.[0]); event.target.value = ''; }} /></label><span>{fixture} · synthetic only</span></div>
    {error && <div className="warning" role="alert">{error}</div>}
    {!busy && !decision && <button onClick={() => void evaluate(request)}>Retry current case</button>}
    <nav>{(['spread', 'memo', 'audit'] as const).map(value => <button className={tab === value ? 'active' : ''} onClick={() => setTab(value)} key={value}>{value}</button>)}</nav>
    {tab === 'spread' && <section className="grid"><div className="panel wide"><div className="panelTitle"><h2>Spread review</h2><span>Select a line item to override · rationale required</span></div><div className="tableScroll"><table><thead><tr><th>Line item</th><th>Latest period</th><th>Source</th><th>Status</th></tr></thead><tbody>{lines.map((line, index) => <tr key={line.key}><td><button className="rowEdit" onClick={() => edit(index)} disabled={busy}>{line.label}</button></td><td className="num">${money(Number(year[line.key]))}</td><td>{fixture === 'alpine.json' ? line.source : 'Imported JSON'}</td><td><span className="pill">{audit.some(event => event.field === line.key) ? 'Human override' : 'Supplied input'}</span></td></tr>)}</tbody></table></div></div><div className="panel"><h2>Coverage</h2>{decision ? decision.factors.filter(factor => factor.name !== 'k1_history').map(factor => <div className="metric" key={factor.name}><span>{labels[factor.name] ?? factor.name}</span><strong>{display(factor)}</strong><small>{factor.name === 'uca_positive' ? 'Must be positive' : `floor ${factor.threshold}x`} · {factor.passed === null ? 'Review required' : factor.passed ? 'Pass' : 'Below policy'}</small></div>) : <p>{busy ? 'Calculating current inputs…' : 'No current results. Check the backend and retry.'}</p>}</div></section>}
    {tab === 'memo' && <section className="panel memo"><div className="panelTitle"><h2>Credit memo</h2><span>Generated from stored decision factors</span></div>{decision ? <><h3>Recommendation</h3><p>{decision.outcome[0].toUpperCase() + decision.outcome.slice(1)} for prototype demonstration based on the current inputs.</p><h3>Primary factors considered</h3><ul>{decision.factors.map(factor => <li key={factor.name}>{labels[factor.name] ?? factor.name}: {display(factor)} — {factor.passed === null ? 'manual review required' : factor.passed ? 'meets configured policy' : 'does not meet configured policy'}</li>)}</ul>{decision.reasons.length > 0 && <><h3>Recorded reasons</h3><ul>{decision.reasons.map(reason => <li key={reason.code}>{reason.message}</li>)}</ul></>}</> : <p>No current decision is available.</p>}<p className="fine">{disclaimer}</p></section>}
    {tab === 'audit' && <section className="panel memo"><div className="panelTitle"><h2>Audit trail</h2><span>{audit.length} human overrides</span></div>{audit.length === 0 ? <p>No overrides yet.</p> : audit.map((event, index) => <div className="audit" key={index}><strong>{event.field}</strong><span>{String(event.prior_value)} → {String(event.new_value)}</span><small>{event.rationale}</small></div>)}</section>}
  </main>;
}
