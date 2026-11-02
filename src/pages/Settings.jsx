import { useState } from 'react'
import { Card, Btn, Field, inputCls, Confirm } from '../components/common'
import { useApp } from '../store'
import { USERS, REGIONS } from '../data/seed'
export default function Settings() {
  const { s, A, user } = useApp(); const [c, setC] = useState(false)
  return <div className="grid gap-4 lg:grid-cols-2">
    <Card title="Demo user & view"><p className="mb-3 text-sm">Signed in as <b>{user.name}</b> (demo profile).</p>
      <Field label="Role view (illustrative)"><select className={inputCls} value={s.role} onChange={e => A.setRole(e.target.value)}>{Object.keys(USERS).map(r => <option key={r}>{r}</option>)}</select></Field>
      {s.role === 'Regional Officer' && <div className="mt-3"><Field label="Region"><select className={inputCls} value={s.region} onChange={e => A.setRegion(e.target.value)}>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></Field></div>}
      <p className="mt-3 text-xs text-slate-500">The role selector only filters what is displayed. It is a demonstration, not authentication or access control — all data remains in the browser.</p></Card>
    <Card title="Prototype notification preferences (in-app only)">{[['overlap', 'Overlap alerts'], ['deadline', 'Deadline & overdue alerts'], ['escalation', 'Escalation alerts']].map(([k, l]) => <label key={k} className="flex items-center gap-2 py-1 text-sm"><input type="checkbox" checked={s.prefs[k]} onChange={e => A.setPrefs({ [k]: e.target.checked })} />{l}</label>)}
      <div className="mt-3 max-w-40"><Field label="Approaching-deadline threshold (days)"><input type="number" min={1} max={30} className={inputCls} value={s.prefs.approach} onChange={e => A.setPrefs({ approach: Math.min(30, Math.max(1, +e.target.value || 1)) })} /></Field></div>
      <p className="mt-2 text-xs text-slate-500">No email, SMS or WhatsApp messages are sent; notifications are in-app only.</p></Card>
    <Card title="Demo data"><p className="mb-3 text-sm">Reset restores the original synthetic dataset (dates re-anchored to today) and clears all changes, audit entries and decisions.</p><Btn kind="danger" onClick={() => setC(true)}>Reset demo data</Btn></Card>
    <Card title="Prototype limitations"><ul className="list-disc space-y-1 pl-5 text-sm text-slate-700"><li>Frontend only: no backend, database, login or real integrations.</li><li>All records are fictional synthetic data, not AICTE records.</li><li>Overlap scores are transparent heuristics, not validated AI probabilities.</li><li>SLA thresholds are demo values, not official timelines.</li><li>Data lives in this browser’s localStorage only.</li></ul></Card>
    {c && <Confirm msg="Reset all demo data to the original synthetic dataset? Your changes will be lost." yes="Reset" onNo={() => setC(false)} onYes={() => { A.reset(); setC(false) }} />}
  </div>
}
