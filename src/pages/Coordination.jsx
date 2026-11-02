import { useState } from 'react'
import { Card, Btn, Banner, Empty, Field, inputCls, Th, Bureau } from '../components/common'
import Compare from '../components/Compare'
import { useApp } from '../store'
import { fmtTime } from '../utils/dates'
import { OFFICERS } from '../data/seed'
const CS = ['Open', 'In Review', 'Awaiting Action', 'Resolved']
export default function Coordination({ filter }) {
  const { overlaps, allCases, A, openOv } = useApp()
  const [key, setKey] = useState(filter.key || null), [cmp, setCmp] = useState(false)
  const o = overlaps.find(x => x.key === key)
  const pr = o ? (allCases.filter(c => [o.a, o.b].includes(c.id)).some(c => c.priority === 'High') ? 'High' : 'Normal') : ''
  return <div className="space-y-4">
    <Banner n={openOv.length} />
    <Card className="!p-0 overflow-x-auto">{overlaps.length ? <table className="w-full text-sm"><thead className="border-b bg-slate-50"><tr><Th>Institution</Th><Th>Linked cases</Th><Th>Bureaus</Th><Th>Lead</Th><Th>Coordinator</Th><Th>Status</Th><Th>Updated</Th></tr></thead><tbody>
      {overlaps.map(x => <tr key={x.key} onClick={() => setKey(x.key)} className={`cursor-pointer border-b border-slate-100 hover:bg-blue-50/40 ${x.key === key ? 'bg-blue-50' : ''}`}><td className="px-3 py-2"><b>{x.inst.name}</b><div className="text-xs text-slate-500">{x.inst.pid}</div></td><td className="px-3 py-2 text-xs">{x.a}<br />{x.b}</td><td className="px-3 py-2">{[x.a, x.b].map(id => <div key={id}><Bureau b={allCases.find(c => c.id === id)?.bureau} /></div>)}</td><td className="px-3 py-2">{x.st?.lead || '—'}</td><td className="px-3 py-2">{x.st?.coordinator || '—'}</td><td className="px-3 py-2"><b>{x.coord}</b></td><td className="px-3 py-2 text-xs">{x.st?.updated ? fmtTime(x.st.updated) : '—'}</td></tr>)}</tbody></table> : <Empty text="No coordination items. Overlaps appear here when detected." />}</Card>
    {o ? <WS key={o.key} o={o} pr={pr} A={A} onCmp={() => setCmp(true)} /> : overlaps.length > 0 && <p className="text-sm text-slate-500">Select an item above to open its coordination workspace.</p>}
    {cmp && o && <Compare o={o} onClose={() => setCmp(false)} />}
  </div>
}
function WS({ o, pr, A, onCmp }) {
  const st = o.st || {}
  const [lead, setLead] = useState(st.lead || ''), [coord, setCoord] = useState(st.coordinator || ''), [dec, setDec] = useState(st.decision || ''), [status, setStatus] = useState(o.coord), [note, setNote] = useState(''), [err, setErr] = useState('')
  const { allCases } = useApp()
  const bureaus = [...new Set([o.a, o.b].map(id => allCases.find(c => c.id === id)?.bureau).filter(Boolean))]
  const save = () => { if (!lead) return setErr('Choose a lead Bureau/Cell.'); if (!coord.trim()) return setErr('Enter the assigned coordinator.'); if (!dec.trim()) return setErr('Record the coordination decision.'); setErr('')
    A.ov(o, { lead, coordinator: coord.trim(), decision: dec.trim(), coord: status, review: o.review === 'pending' ? 'reviewed' : o.review }, status === 'Resolved' ? 'Coordination resolved' : 'Coordination updated', `${o.a} / ${o.b}: lead ${lead}, status ${status}. Decision: ${dec.trim()}`, 'Coordination decision saved') }
  return <Card title={`Coordination workspace · ${o.inst.name}`} action={<Btn onClick={onCmp}>Review both cases</Btn>}>
    <p className="mb-3 text-xs text-slate-500">Reason: {o.signals.map(s => s.label).join('; ')}. Priority: {pr}. Resolving coordination does <b>not</b> dispose the complaints.</p>
    <div className="grid gap-3 md:grid-cols-3">
      <Field label="Lead Bureau/Cell"><select className={inputCls} value={lead} onChange={e => { setLead(e.target.value); if (!coord) setCoord(OFFICERS[e.target.value]?.[0] || '') }}><option value="">Select…</option>{bureaus.map(b => <option key={b}>{b}</option>)}</select></Field>
      <Field label="Assigned coordinator"><input className={inputCls} value={coord} onChange={e => setCoord(e.target.value)} /></Field>
      <Field label="Coordination status"><select className={inputCls} value={status} onChange={e => setStatus(e.target.value)}>{CS.map(s => <option key={s}>{s}</option>)}</select></Field>
      <div className="md:col-span-3"><Field label="Coordination decision"><textarea rows={2} className={inputCls} value={dec} onChange={e => setDec(e.target.value)} placeholder="e.g. RB leads; PGRC to share complainant statements" /></Field></div></div>
    {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
    <div className="mt-3"><Btn kind="primary" onClick={save}>Save decision</Btn></div>
    <div className="mt-4"><div className="mb-1 text-sm font-medium">Notes & follow-ups</div>
      {(st.notes || []).map((n, i) => <div key={i} className="border-b border-slate-100 py-1 text-sm"><span className="text-xs text-slate-500">{fmtTime(n.ts)} · {n.by}</span><br />{n.text}</div>)}
      <div className="mt-2 flex gap-2"><input className={inputCls} placeholder="Add a note or follow-up action" value={note} onChange={e => setNote(e.target.value)} /><Btn disabled={!note.trim()} onClick={() => { A.addNote(o, note.trim()); setNote('') }}>Add note</Btn></div></div>
  </Card>
}
