import { X, AlertTriangle, Clock, CheckCircle2, CircleDot, Inbox } from 'lucide-react'
export const STATUS_STYLE = { Pending: 'bg-amber-50 text-amber-800 ring-amber-300', 'Under Process': 'bg-blue-50 text-blue-800 ring-blue-300', Disposed: 'bg-emerald-50 text-emerald-800 ring-emerald-300', Transferred: 'bg-slate-100 text-slate-700 ring-slate-300', Escalated: 'bg-red-50 text-red-800 ring-red-300' }
export const Status = ({ s }) => <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STATUS_STYLE[s] || ''}`}>{s}</span>
export const Prio = ({ p }) => <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${p === 'High' ? 'bg-red-100 text-red-800' : p === 'Low' ? 'bg-slate-100 text-slate-600' : 'bg-blue-100 text-blue-800'}`}>{p === 'High' ? '▲ ' : p === 'Low' ? '▽ ' : '● '}{p}</span>
export function SlaBadge({ x }) {
  const m = { overdue: ['bg-red-100 text-red-800', AlertTriangle], approaching: ['bg-amber-100 text-amber-800', Clock], ok: ['bg-slate-100 text-slate-700', CircleDot], closed: ['bg-emerald-100 text-emerald-800', CheckCircle2], unknown: ['bg-slate-100 text-slate-500', CircleDot] }[x.state]
  const I = m[1]
  return <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${m[0]}`}><I size={12} />{x.label}</span>
}
export const Card = ({ title, action, children, className = '' }) => (
  <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
    {(title || action) && <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-800">{title}</h3>{action}</div>}
    {children}
  </section>
)
export const Btn = ({ kind = 'default', className = '', ...p }) => <button {...p} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${kind === 'primary' ? 'bg-blue-700 text-white hover:bg-blue-800' : kind === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'} ${className}`} />
export const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm'
export const Field = ({ label, error, children }) => <label className="block text-sm"><span className="mb-1 block font-medium text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>
export function Modal({ title, onClose, children, wide }) {
  return <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <div className={`mt-8 w-full ${wide ? 'max-w-5xl' : 'max-w-xl'} rounded-xl bg-white shadow-xl`}><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><h2 className="font-semibold">{title}</h2><button aria-label="Close" onClick={onClose}><X size={18} /></button></div><div className="p-4">{children}</div></div></div>
}
export function Drawer({ title, onClose, children }) {
  return <div className="fixed inset-0 z-40 bg-slate-900/40" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3"><h2 className="font-semibold">{title}</h2><button aria-label="Close" onClick={onClose}><X size={18} /></button></div><div className="p-4">{children}</div></aside></div>
}
export const Confirm = ({ msg, yes = 'Confirm', onYes, onNo }) => <Modal title="Please confirm" onClose={onNo}><p className="mb-4 text-sm text-slate-700">{msg}</p><div className="flex justify-end gap-2"><Btn onClick={onNo}>Cancel</Btn><Btn kind="danger" onClick={onYes}>{yes}</Btn></div></Modal>
export const Empty = ({ text }) => <div className="flex flex-col items-center gap-2 py-10 text-sm text-slate-500"><Inbox size={28} />{text}</div>
export const Banner = ({ n }) => <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"><AlertTriangle className="shrink-0" size={20} /><div><div className="font-semibold">Potential Overlapping Cases – Coordination Required</div>{n != null && <div className="text-xs">{n} open item(s) need coordination between Bureaus/Cells.</div>}</div></div>
export const Th = ({ children, k, sort, setSort }) => <th className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-slate-600">{k ? <button className="inline-flex items-center gap-1" onClick={() => setSort({ k, dir: sort.k === k && sort.dir === 'asc' ? 'desc' : 'asc' })}>{children}{sort.k === k ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}</button> : children}</th>
export const Bureau = ({ b }) => <span className="inline-flex items-center gap-1 text-xs font-medium"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: { RB: '#1d4ed8', PGRC: '#7c3aed', AB: '#0f766e', RO: '#c2410c' }[b] || '#64748b' }} />{b}</span>
