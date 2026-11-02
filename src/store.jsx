import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { institutions, seedCases, seedOv, USERS } from './data/seed'
import { computeOverlaps, resolve } from './utils/matching'
import { sla, isoOff } from './utils/dates'

const KEY = 'casesync-state-v1'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)
const p = n => String(n).padStart(2, '0')
export const stamp = () => { const d = new Date(); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` }
const uid = () => 'A' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const fresh = () => ({ cases: seedCases(), ov: seedOv(), audit: [{ id: 'A0', ts: stamp(), type: 'Demo data loaded', ref: 'System', user: 'System', desc: 'Synthetic demo dataset loaded.' }], read: [], role: 'Management', region: 'North', prefs: { overlap: true, deadline: true, escalation: true, approach: 3 } })
function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && Array.isArray(s.cases) && Array.isArray(s.audit) && s.ov && typeof s.ov === 'object' && s.prefs && USERS[s.role]) return s } catch (e) { /* corrupted storage -> fall back to seed */ }
  return fresh()
}
const log = (d, type, ref, desc) => d.audit.unshift({ id: uid(), ts: stamp(), type, ref, user: USERS[d.role].name, desc })
const touch = (c, type, remark, last, who) => { c.history.push({ ts: stamp(), bureau: c.bureau, officer: who || c.officer, type, remark }); c.lastDate = isoOff(0); if (last) c.lastAction = last }

export function Provider({ children }) {
  const [s, setS] = useState(load)
  const [toasts, setToasts] = useState([])
  const [ui, setUi] = useState({ caseId: null, form: null })
  const [nav, setNav] = useState({ page: 'overview', filter: {}, k: 0 })
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)) } catch (e) { /* storage unavailable */ } }, [s])
  const toast = useCallback(m => { const id = Math.random(); setToasts(t => [...t, { id, m }]); setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200) }, [])
  const go = useCallback((page, filter = {}) => setNav({ page, filter, k: Date.now() }), [])

  // commit: clone state, mutate, then log any newly suggested overlaps
  const commit = useCallback((fn, msg) => {
    setS(prev => {
      const d = structuredClone(prev)
      const before = new Set(computeOverlaps(prev.cases, institutions).map(o => o.key))
      fn(d)
      computeOverlaps(d.cases, institutions).forEach(o => { if (!before.has(o.key) && !d.ov[o.key]) log(d, 'Overlap suggested', `${o.a} / ${o.b}`, `Potential overlap suggested for ${o.inst.name} (heuristic score ${o.score}).`) })
      return d
    })
    if (msg) toast(msg)
  }, [toast])
  const find = (d, id) => d.cases.find(c => c.id === id)

  const A = {
    addCase: f => commit(d => {
      let n = 1; const pre = `${f.bureau}-2026-`
      while (d.cases.some(c => c.id === pre + String(n).padStart(3, '0'))) n++
      const id = pre + String(n).padStart(3, '0')
      d.cases.push({ id, pid: f.pid || null, rawName: f.rawName, category: f.category, desc: f.desc, received: f.received, status: 'Pending', bureau: f.bureau, officer: f.officer, priority: f.priority, lastAction: 'Complaint registered', nextAction: f.nextAction, lastDate: isoOff(0), due: f.due, region: f.region, related: [], history: [{ ts: stamp(), bureau: f.bureau, officer: f.officer, type: 'Complaint Received', remark: f.desc }] })
      log(d, 'Complaint created', id, `Complaint ${id} created for ${f.rawName}.`)
    }, 'Complaint created'),
    editCase: (id, f) => commit(d => { const c = find(d, id); if (!c) return; Object.assign(c, f); touch(c, 'Edited', 'Complaint details edited.'); log(d, 'Complaint edited', id, `Complaint ${id} details edited.`) }, 'Complaint updated'),
    setStatus: (id, status, remark) => commit(d => { const c = find(d, id); if (!c) return; const old = c.status; c.status = status; touch(c, 'Status Change', `${old} → ${status}. ${remark || ''}`, `Status changed to ${status}`); log(d, 'Status changed', id, `${id}: ${old} → ${status}.`) }, 'Status updated'),
    reassign: (id, bureau, officer) => commit(d => { const c = find(d, id); if (!c) return; const o = `${c.bureau}/${c.officer}`; c.bureau = bureau; c.officer = officer; touch(c, 'Reassignment', `Reassigned from ${o} to ${bureau}/${officer}.`, 'Reassigned'); log(d, 'Reassigned', id, `${id} reassigned ${o} → ${bureau}/${officer}.`) }, 'Case reassigned'),
    setNext: (id, next, due) => commit(d => { const c = find(d, id); if (!c) return; c.nextAction = next; c.due = due; touch(c, 'Plan Update', `Next action: ${next}; expected disposal ${due}.`); log(d, 'Complaint edited', id, `${id}: next action / expected disposal updated.`) }, 'Next action saved'),
    addRemark: (id, text) => commit(d => { const c = find(d, id); if (!c) return; touch(c, 'Remark', text, text); log(d, 'Remark added', id, `Remark added to ${id}.`) }, 'Remark added'),
    escalate: (id, text) => commit(d => { const c = find(d, id); if (!c) return; c.status = 'Escalated'; touch(c, 'Escalation', text, 'Escalated: ' + text); log(d, 'Escalation recorded', id, `${id} escalated. ${text}`) }, 'Escalation recorded'),
    deleteCase: id => commit(d => { d.cases = d.cases.filter(c => c.id !== id); d.cases.forEach(c => { c.related = c.related.filter(x => x !== id) }); log(d, 'Complaint deleted', id, `Demo record ${id} deleted.`) }, 'Demo record deleted'),
    // overlap decisions & coordination
    ov: (o, patch, type, desc, msg) => commit(d => {
      const prev = d.ov[o.key] || { review: 'pending', coord: 'Open', lead: '', coordinator: '', decision: '', notes: [] }
      d.ov[o.key] = { ...prev, ...patch, sig: o.sig, updated: stamp() }
      log(d, type, `${o.a} / ${o.b}`, desc)
      if (patch.review === 'linked') { const a = find(d, o.a), b = find(d, o.b); if (a && b) { if (!a.related.includes(b.id)) a.related.push(b.id); if (!b.related.includes(a.id)) b.related.push(a.id); touch(a, 'Linked', `Linked with ${b.id} (${b.bureau}).`); touch(b, 'Linked', `Linked with ${a.id} (${a.bureau}).`) } }
    }, msg),
    addNote: (o, text) => commit(d => { const prev = d.ov[o.key] || { review: 'pending', coord: 'Open', lead: '', coordinator: '', decision: '', notes: [] }; d.ov[o.key] = { ...prev, notes: [...prev.notes, { ts: stamp(), by: USERS[d.role].name, text }], sig: o.sig, updated: stamp() }; log(d, 'Coordination updated', `${o.a} / ${o.b}`, `Follow-up note: ${text}`) }, 'Note added'),
    reset: () => { setS(fresh()); toast('Demo data restored to the original synthetic dataset') },
    markRead: id => setS(d => ({ ...d, read: id === 'all' ? [...new Set([...d.read, ...(A._ids || [])])] : [...new Set([...d.read, id])] })),
    setRole: r => commit(d => { d.role = r }),
    setRegion: r => commit(d => { d.region = r }),
    setPrefs: pr => setS(d => ({ ...d, prefs: { ...d.prefs, ...pr } })),
  }

  const cases = useMemo(() => s.cases.filter(c => s.role === 'RB Officer' ? c.bureau === 'RB' : s.role === 'PGRC Officer' ? c.bureau === 'PGRC' : s.role === 'Regional Officer' ? c.region === s.region : true), [s.cases, s.role, s.region])
  const ovAll = useMemo(() => computeOverlaps(s.cases, institutions).map(o => {
    const st = s.ov[o.key]; const rejectedNow = st?.review === 'rejected' && st.sig === o.sig
    return { ...o, st, review: st ? (st.review === 'rejected' && !rejectedNow ? 'pending' : st.review) : 'pending', coord: st?.coord || 'Open', rejected: rejectedNow }
  }), [s.cases, s.ov])
  const overlaps = useMemo(() => { const ids = new Set(cases.map(c => c.id)); return ovAll.filter(o => !o.rejected && (ids.has(o.a) || ids.has(o.b))) }, [ovAll, cases])
  const instMap = useMemo(() => Object.fromEntries(s.cases.map(c => [c.id, resolve(c, institutions)?.inst?.pid])), [s.cases])
  const rejected = ovAll.filter(o => o.rejected)
  const openOv = overlaps.filter(o => o.coord !== 'Resolved')
  const slaOf = useCallback(c => sla(c, s.prefs.approach), [s.prefs.approach])
  const notifs = useMemo(() => {
    const n = [], P = s.prefs
    if (P.overlap) openOv.forEach(o => n.push({ id: 'ov-' + o.key + o.sig.length, type: 'Overlap', text: `Potential overlap at ${o.inst.name}: ${o.a} & ${o.b}`, page: 'overlaps' }))
    cases.forEach(c => { const x = slaOf(c)
      if (P.deadline && x.state === 'overdue') n.push({ id: 'od-' + c.id, type: 'Overdue', text: `${c.id} is ${x.label} (${c.rawName})`, caseId: c.id })
      if (P.deadline && x.state === 'approaching') n.push({ id: 'ap-' + c.id, type: 'Deadline', text: `${c.id} ${x.label.toLowerCase()} (${c.rawName})`, caseId: c.id })
      if (P.escalation && c.status === 'Escalated') n.push({ id: 'es-' + c.id, type: 'Escalation', text: `${c.id} is escalated (${c.bureau})`, caseId: c.id }) })
    overlaps.filter(o => o.coord === 'Awaiting Action').forEach(o => n.push({ id: 'cf-' + o.key, type: 'Follow-up', text: `Coordination follow-up awaited: ${o.a} & ${o.b}`, page: 'coordination' }))
    return n
  }, [cases, overlaps, slaOf, s.prefs])
  A._ids = notifs.map(n => n.id)

  const v = { instMap, s, cases, allCases: s.cases, institutions, overlaps, ovAll, rejected, openOv, notifs, slaOf, toast, toasts, ui, setUi, nav, go, A, openCase: id => setUi(u => ({ ...u, caseId: id })), user: USERS[s.role] }
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
