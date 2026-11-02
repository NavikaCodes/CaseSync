import { Modal, Status, Prio, Bureau, SlaBadge } from './common'
import { useApp } from '../store'
import { fmtDate } from '../utils/dates'
export default function Compare({ o, onClose }) {
  const { allCases, slaOf } = useApp()
  return <Modal wide title={`Side-by-side: ${o.a} ↔ ${o.b}`} onClose={onClose}>
    <div className="grid gap-4 md:grid-cols-2">{[o.a, o.b].map(id => { const c = allCases.find(x => x.id === id); if (!c) return <div key={id}>Case {id} no longer exists.</div>
      return <div key={id} className="space-y-2 rounded-lg border border-slate-200 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><b>{c.id}</b><Status s={c.status} /><Prio p={c.priority} /><SlaBadge x={slaOf(c)} /></div><p className="rounded bg-slate-50 p-2">{c.desc}</p>
        {[['Bureau/Cell', <Bureau b={c.bureau} />], ['Officer', c.officer], ['Category', c.category], ['Institution as received', c.rawName], ['Last action', c.lastAction], ['Next action', c.nextAction], ['Expected disposal', fmtDate(c.due)]].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><span className="text-slate-500">{k}</span><span className="text-right">{v}</span></div>)}</div> })}</div>
  </Modal>
}
