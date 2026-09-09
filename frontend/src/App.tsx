import { useMemo, useState } from 'react';

type Audit = {field:string; prior:string; next:string; rationale:string};
const disclaimer='Prototype demonstration only. This output has not been validated for use in an actual lending decision. Use synthetic data only; this is not legal or compliance advice.';
const seed=[
 {line:'Gross receipts',value:'4,200,000',source:'1120-S L1',status:'Confirmed'},
 {line:'COGS',value:'2,750,000',source:'1120-S L2',status:'Confirmed'},
 {line:'Interest expense',value:'62,000',source:'1120-S L13',status:'Confirmed'},
 {line:'Depreciation',value:'95,000',source:'Synthetic add-back',status:'Confirmed'},
];

export default function App(){
 const [rows,setRows]=useState(seed); const [audit,setAudit]=useState<Audit[]>([]); const [tab,setTab]=useState<'spread'|'memo'|'audit'>('spread'); const [fixture,setFixture]=useState('synthetic_1120s.txt');
 const total=useMemo(()=>rows.reduce((s,r)=>s+(Number(r.value.replaceAll(',',''))||0),0),[rows]);
 function edit(i:number){const next=prompt('Override value',rows[i].value); if(next===null||next===rows[i].value)return; const why=prompt('Required rationale'); if(!why)return; const prior=rows[i].value; setRows(v=>v.map((r,j)=>j===i?{...r,value:next,status:'Human override'}:r)); setAudit(v=>[...v,{field:rows[i].line,prior,next,rationale:why}]);}
 return <main>
  <header><div><div className="eyebrow">CREDIT WORKSPACE / SYNTHETIC</div><h1>Alpine Fabrication</h1><p>Commercial · 2025 review · Analyst-assisted</p></div><div className="decision"><span>Illustrative decision</span><strong>APPROVE</strong><small>Coverage comfortably above prototype floors</small></div></header>
  <div className="warning">{disclaimer}</div>
  <div className="uploadbar"><label>Fixture <input type="file" accept=".txt,.json,.csv" onChange={e=>setFixture(e.target.files?.[0]?.name||'synthetic_1120s.txt')}/></label><span>{fixture} · synthetic only</span></div>
  <nav>{(['spread','memo','audit'] as const).map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}</button>)}</nav>
  {tab==='spread'&&<section className="grid"><div className="panel wide"><div className="panelTitle"><h2>Spread review</h2><span>Click a row to override · rationale required</span></div><table><thead><tr><th>Line item</th><th>2025</th><th>Source</th><th>Status</th></tr></thead><tbody>{rows.map((r,i)=><tr key={r.line} onClick={()=>edit(i)}><td>{r.line}</td><td className="num">${r.value}</td><td>{r.source}</td><td><span className="pill">{r.status}</span></td></tr>)}</tbody></table></div><div className="panel"><h2>Coverage</h2><Metric label="DSCR" value="3.135x" note="floor 1.25x"/><Metric label="FCCR" value="2.800x" note="floor 1.20x"/><Metric label="Global DSCR" value="2.902x" note="floor 1.25x"/><Metric label="UCA cash flow" value="$385k" note="vs EBITDA $630k"/><div className="trace">Displayed spread values total: ${total.toLocaleString()}</div></div></section>}
  {tab==='memo'&&<section className="panel memo"><div className="panelTitle"><h2>Credit memo</h2><span>Generated from stored decision factors</span></div><h3>Recommendation</h3><p>Approve for prototype demonstration. 2025 DSCR, FCCR, and global DSCR exceed the configured policy floors. UCA-style cash flow remains positive after the synthetic working-capital build.</p><h3>Primary factors considered</h3><ul><li>DSCR 3.135x</li><li>FCCR 2.800x</li><li>Global DSCR 2.902x</li><li>K-1 distribution history: stable</li></ul><p className="fine">{disclaimer}</p></section>}
  {tab==='audit'&&<section className="panel memo"><div className="panelTitle"><h2>Audit trail</h2><span>{audit.length} human overrides</span></div>{audit.length===0?<p>No overrides yet.</p>:audit.map((a,i)=><div className="audit" key={i}><strong>{a.field}</strong><span>{a.prior} → {a.next}</span><small>{a.rationale}</small></div>)}</section>}
 </main>
}
function Metric({label,value,note}:{label:string,value:string,note:string}){return <div className="metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>}
