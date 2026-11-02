import { useState } from 'react'
import { Drawer, Status, Prio, SlaBadge, Btn, Field, inputCls, Confirm, Bureau } from './common'
import Timeline from './Timeline'
import { useApp } from '../store'
import { STATUSES, BUREAUS, OFFICERS } from '../data/seed'
import { fmtDate, ageDays } from '../utils/dates'
import { resolve } from '../utils/matching'
export default function CaseDrawer() {
  const { ui, setUi, allCases, institutions, A, slaOf, openCase, go } = useApp()
  const c = allCases.find(x => x.id === ui.caseId)
  const [remark, setRemark] = useState(''), [stat, setStat] = useState(''), [b, setB] = useState(''), [o, setO] = useState(''), [next, setNext] = useState(null), [due, setDue] = useState(null), [del, setDel] = useState(false), [err, setErr] = useState('')
  if (!c) return null
  const close = () => setUi(u => ({ ...u, caseId: null }))
  const inst = resolve(c, institutions)?.inst
  const nb = b || c.bureau
  return <Drawer title={`Case ${c.id}`} onClose={close}>
    <div className="space-y-4 text-sm" key={c.id}>
      <div className="flex flex-wrap items-center gap-2"><Status s={c.status} /><Prio p={c.priority} /><SlaBadge x={slaOf(c)} /><Bureau b={c.bureau} /></div>
      <p className="rounded-lg bg-slate-50 p-3">{c.desc}</p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {[['Institution', inst ? <button className="text-blue-700 underline" onClick={() => { close(); go('institutions', { pid: inst.pid }) }}>{inst.name}</button> : c.rawName], ['Permanent ID', inst?.pid || '—'], ['Name as received', c.rawName], ['Category', c.category], ['Region', c.region], ['Officer', c.officer], ['Received', `${fmtDate(c.received)} (${ageDays(c)}d ago)`], ['Expected disposal', fmtDate(c.due)], ['Last action', c.lastAction], ['Last action date', fmtDate(c.lastDate)], ['Next action', c.nextAction]].map(([k, v]) => <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd>{v}</dd></div>)}
      </dl>
      {c.related.length > 0 && <div>Related cases: {c.related.map(r => <button key={r} className="mr-2 text-blue-700 underline" onClick={() => openCase(r)}>{r}</button>)}</div>}
      <div className="flex flex-wrap gap-2"><Btn onClick={() => setUi(u => ({ ...u, form: { mode: 'edit', id: c.id } }))}>Edit details</Btn><Btn kind="danger" onClick={() => setDel(true)}>Delete demo record</Btn></div>
      <div className="grid gap-3 rounded-lg border border-slate-200 p-3">
        <div className="flex items-end gap-2"><div className="flex-1"><Field label="Change status"><select className={inputCls} value={stat || c.status} onChange={e => setStat(e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field></div><Btn disabled={!stat || stat === c.status} onClick={() => { A.setStatus(c.id, stat, remark); setStat('') }}>Update</Btn></div>
        <div className="flex items-end gap-2"><div className="flex-1"><Field label="Bureau/Cell"><select className={inputCls} value={nb} onChange={e => { setB(e.target.value); setO(OFFICERS[e.target.value][0]) }}>{Object.entries(BUREAUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field></div>
          <div className="flex-1"><Field label="Officer"><select className={inputCls} value={o || (nb === c.bureau ? c.officer : OFFICERS[nb][0])} onChange={e => setO(e.target.value)}>{OFFICERS[nb].map(x => <option key={x}>{x}</option>)}</select></Field></div>
          <Btn onClick={() => { A.reassign(c.id, nb, o || (nb === c.bureau ? c.officer : OFFICERS[nb][0])); setB(''); setO('') }}>Reassign</Btn></div>
        <div className="flex items-end gap-2"><div className="flex-1"><Field label="Next action"><input className={inputCls} value={next ?? c.nextAction} onChange={e => setNext(e.target.value)} /></Field></div>
          <div><Field label="Expected disposal"><input type="date" className={inputCls} value={due ?? c.due} onChange={e => setDue(e.target.value)} /></Field></div>
          <Btn onClick={() => { const n = (next ?? c.nextAction).trim(), d = due ?? c.due; if (!n || !d) return setErr('Next action and date are required.'); setErr(''); A.setNext(c.id, n, d); setNext(null); setDue(null) }}>Save</Btn></div>
        {err && <div className="text-xs text-red-600">{err}</div>}
        <div className="flex items-end gap-2"><div className="flex-1"><Field label="Add remark to history"><input className={inputCls} value={remark} onChange={e => setRemark(e.target.value)} placeholder="Remark / action taken" /></Field></div><Btn kind="primary" disabled={!remark.trim()} onClick={() => { A.addRemark(c.id, remark.trim()); setRemark('') }}>Add</Btn></div>
      </div>
      <div><h4 className="mb-2 font-semibold">Action history</h4><Timeline events={c.history} /></div>
    </div>
    {del && <Confirm msg={`Delete demo record ${c.id}? This removes it from all views (use Settings → Reset to restore).`} yes="Delete" onNo={() => setDel(false)} onYes={() => { A.deleteCase(c.id); setDel(false); close() }} />}
  </Drawer>
}
