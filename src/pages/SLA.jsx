import { useMemo, useState } from 'react'
import { Card, Status, SlaBadge, Btn, inputCls, Th, Empty, Modal, Field, Bureau } from '../components/common'
import { useApp } from '../store'
import { STATUSES, BUREAUS, REGIONS } from '../data/seed'
import { fmtDate, ageDays } from '../utils/dates'
export default function SLA() {
  const { cases, slaOf, openCase, A, s } = useApp()
  const [f, setF] = useState({ bureau: '', status: '', region: '', urgency: '' }), [esc, setEsc] = useState(null), [txt, setTxt] = useState(''), [err, setErr] = useState('')
  const rows = useMemo(() => cases.filter(c => c.status !== 'Disposed' && (!f.bureau || c.bureau === f.bureau) && (!f.status || c.status === f.status) && (!f.region || c.region === f.region) && (!f.urgency || slaOf(c).state === f.urgency)).sort((a, b) => { const r = x => { const z = slaOf(x); return z.state === 'overdue' ? -z.days : z.days ?? 9999 }; return r(a) - r(b) }), [cases, f, slaOf])
  const n = st => cases.filter(c => slaOf(c).state === st).length
  const sel = (k, o, l) => <select className={inputCls + ' !w-auto'} value={f[k]} onChange={e => setF(x => ({ ...x, [k]: e.target.value }))}><option value="">{l}</option>{o.map(x => Array.isArray(x) ? <option key={x[0]} value={x[0]}>{x[1]}</option> : <option key={x}>{x}</option>)}</select>
  return <div className="space-y-4">
    <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">Prototype thresholds only — not official AICTE timelines. “Approaching” = due within <b>{s.prefs.approach}</b> day(s) (configurable in Settings); “Overdue” = expected disposal date has passed. Days pending = today − date received.</p>
    <div className="grid grid-cols-3 gap-3">{[['Overdue', n('overdue')], ['Approaching', n('approaching')], ['On track', n('ok')]].map(([k, v]) => <Card key={k}><div className="text-xs text-slate-500">{k}</div><div className="text-2xl font-semibold">{v}</div></Card>)}</div>
    <Card><div className="flex flex-wrap gap-2">{sel('bureau', Object.keys(BUREAUS), 'All Bureaus/Cells')}{sel('status', STATUSES.filter(x => x !== 'Disposed'), 'All statuses')}{sel('region', REGIONS, 'All regions')}{sel('urgency', [['overdue', 'Overdue'], ['approaching', 'Approaching'], ['ok', 'On track']], 'All urgency')}</div></Card>
    <Card className="!p-0 overflow-x-auto">{rows.length ? <table className="w-full text-sm"><thead className="border-b bg-slate-50"><tr><Th>Case</Th><Th>Bureau</Th><Th>Status</Th><Th>Days pending</Th><Th>Expected disposal</Th><Th>Urgency</Th><Th>Action</Th></tr></thead><tbody>
      {rows.map(c => <tr key={c.id} className="border-b border-slate-100"><td className="cursor-pointer px-3 py-2" onClick={() => openCase(c.id)}><b className="text-blue-800">{c.id}</b><div className="text-xs text-slate-500">{c.rawName}</div></td><td className="px-3 py-2"><Bureau b={c.bureau} /></td><td className="px-3 py-2"><Status s={c.status} /></td><td className="px-3 py-2">{ageDays(c)}</td><td className="px-3 py-2">{fmtDate(c.due)}</td><td className="px-3 py-2"><SlaBadge x={slaOf(c)} /></td><td className="px-3 py-2"><Btn onClick={() => { setEsc(c); setTxt(''); setErr('') }}>Escalate</Btn></td></tr>)}</tbody></table> : <Empty text="No active cases match." />}</Card>
    {esc && <Modal title={`Escalate ${esc.id}`} onClose={() => setEsc(null)}><Field label="Escalation remarks" error={err}><textarea rows={3} className={inputCls} value={txt} onChange={e => setTxt(e.target.value)} /></Field><div className="mt-3 flex justify-end gap-2"><Btn onClick={() => setEsc(null)}>Cancel</Btn><Btn kind="primary" onClick={() => { if (txt.trim().length < 5) return setErr('Enter escalation remarks (min 5 characters).'); A.escalate(esc.id, txt.trim()); setEsc(null) }}>Record escalation</Btn></div></Modal>}
  </div>
}
