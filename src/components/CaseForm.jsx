import { useState } from 'react'
import { Modal, Field, Btn, inputCls } from './common'
import { useApp } from '../store'
import { CATEGORIES, PRIORITIES, OFFICERS, BUREAUS } from '../data/seed'
import { resolve } from '../utils/matching'
import { isoOff } from '../utils/dates'
export default function CaseForm() {
  const { ui, setUi, allCases, institutions, A } = useApp()
  const edit = ui.form.mode === 'edit' ? allCases.find(c => c.id === ui.form.id) : null
  const [f, setF] = useState(edit ? { ...edit } : { rawName: ui.form.rawName || '', pid: '', category: CATEGORIES[0], desc: '', bureau: 'PGRC', officer: OFFICERS.PGRC[0], priority: 'Normal', received: isoOff(0), due: isoOff(14), nextAction: 'Assign for examination' })
  const [err, setErr] = useState({})
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const close = () => setUi(u => ({ ...u, form: null }))
  const submit = e => {
    e.preventDefault(); const er = {}
    if (!f.rawName.trim()) er.rawName = 'Enter the institution name as received.'
    const r = f.rawName.trim() ? resolve({ pid: f.pid.trim(), rawName: f.rawName }, institutions) : null
    if (f.rawName.trim() && !r) er.rawName = 'No matching institution found. Pick a suggestion or enter a valid Permanent ID.'
    if (f.pid.trim() && !institutions.some(i => i.pid === f.pid.trim())) er.pid = 'Unknown Permanent ID. Use a DEMO-xxxx ID from the directory.'
    if (f.desc.trim().length < 10) er.desc = 'Describe the complaint (at least 10 characters).'
    if (!f.due || !f.received) er.due = 'Dates are required.'
    else if (f.due < f.received) er.due = 'Expected disposal cannot be before the received date.'
    if (!f.nextAction.trim()) er.nextAction = 'Enter the next action required.'
    setErr(er); if (Object.keys(er).length) return
    const body = { rawName: f.rawName.trim(), pid: f.pid.trim() || null, category: f.category, desc: f.desc.trim(), bureau: f.bureau, officer: f.officer, priority: f.priority, received: f.received, due: f.due, nextAction: f.nextAction.trim(), region: r.inst.region }
    edit ? A.editCase(edit.id, body) : A.addCase(body); close()
  }
  return <Modal title={edit ? `Edit ${edit.id}` : 'Add complaint'} onClose={close}>
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2"><Field label="Institution name (as received)" error={err.rawName}><input list="inst-list" className={inputCls} value={f.rawName} onChange={e => set('rawName', e.target.value)} placeholder="e.g. A.B.C. Inst. of Technology" /></Field><datalist id="inst-list">{institutions.map(i => <option key={i.pid} value={i.name} />)}</datalist></div>
      <Field label="AICTE Permanent ID (optional)" error={err.pid}><input className={inputCls} value={f.pid || ''} onChange={e => set('pid', e.target.value)} placeholder="DEMO-1001" /></Field>
      <Field label="Category"><select className={inputCls} value={f.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
      <div className="sm:col-span-2"><Field label="Complaint description" error={err.desc}><textarea rows={3} className={inputCls} value={f.desc} onChange={e => set('desc', e.target.value)} /></Field></div>
      <Field label="Bureau/Cell"><select className={inputCls} value={f.bureau} onChange={e => { set('bureau', e.target.value); set('officer', OFFICERS[e.target.value][0]) }}>{Object.entries(BUREAUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
      <Field label="Assigned officer"><select className={inputCls} value={f.officer} onChange={e => set('officer', e.target.value)}>{OFFICERS[f.bureau].map(o => <option key={o}>{o}</option>)}</select></Field>
      <Field label="Priority"><select className={inputCls} value={f.priority} onChange={e => set('priority', e.target.value)}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></Field>
      <Field label="Date received"><input type="date" className={inputCls} value={f.received} onChange={e => set('received', e.target.value)} /></Field>
      <Field label="Expected disposal date" error={err.due}><input type="date" className={inputCls} value={f.due} onChange={e => set('due', e.target.value)} /></Field>
      <Field label="Next action required" error={err.nextAction}><input className={inputCls} value={f.nextAction} onChange={e => set('nextAction', e.target.value)} /></Field>
      <div className="flex justify-end gap-2 sm:col-span-2"><Btn type="button" onClick={close}>Cancel</Btn><Btn kind="primary" type="submit">{edit ? 'Save changes' : 'Add complaint'}</Btn></div>
    </form></Modal>
}
