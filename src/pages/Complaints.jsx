import { useMemo, useState } from 'react'
import { Plus, Download, Search } from 'lucide-react'
import { Card, Status, Prio, SlaBadge, Btn, inputCls, Th, Empty, Bureau } from '../components/common'
import { useApp } from '../store'
import { STATUSES, BUREAUS, REGIONS, CATEGORIES, PRIORITIES } from '../data/seed'
import { fmtDate } from '../utils/dates'
import { downloadCSV } from '../utils/csv'
const PS = 10
export default function Complaints({ filter }) {
  const { cases, slaOf, openCase, setUi } = useApp()
  const [f, setF] = useState({ search: '', status: '', bureau: '', region: '', category: '', priority: '', overdue: false, from: '', to: '', ...filter })
  const [sort, setSort] = useState({ k: 'received', dir: 'desc' }), [page, setPage] = useState(0)
  const set = (k, v) => { setF(x => ({ ...x, [k]: v })); setPage(0) }
  const rows = useMemo(() => {
    const q = f.search.trim().toLowerCase()
    const r = cases.filter(c => (!q || [c.id, c.rawName, c.pid, c.desc].some(v => (v || '').toLowerCase().includes(q))) && (!f.status || c.status === f.status) && (!f.bureau || c.bureau === f.bureau) && (!f.region || c.region === f.region) && (!f.category || c.category === f.category) && (!f.priority || c.priority === f.priority) && (!f.overdue || slaOf(c).state === 'overdue') && (!f.from || c.received >= f.from) && (!f.to || c.received <= f.to))
    const val = c => sort.k === 'sla' ? (slaOf(c).days ?? 9999) * (slaOf(c).state === 'overdue' ? -1 : 1) : sort.k === 'priority' ? PRIORITIES.indexOf(c.priority) : c[sort.k] || ''
    return r.sort((a, b) => { const x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === 'asc' ? 1 : -1) })
  }, [cases, f, sort, slaOf])
  const pages = Math.max(1, Math.ceil(rows.length / PS)), cur = Math.min(page, pages - 1), slice = rows.slice(cur * PS, cur * PS + PS)
  const sel = (k, opts, label) => <select aria-label={label} className={inputCls + ' !w-auto'} value={f[k]} onChange={e => set(k, e.target.value)}><option value="">{label}</option>{opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}</select>
  const exportCSV = () => downloadCSV('casesync_complaints.csv', rows, [{ label: 'Case ID', key: 'id' }, { label: 'Institution', key: 'rawName' }, { label: 'Permanent ID', get: c => c.pid || '' }, { label: 'Category', key: 'category' }, { label: 'Description', key: 'desc' }, { label: 'Received', key: 'received' }, { label: 'Status', key: 'status' }, { label: 'Bureau/Cell', key: 'bureau' }, { label: 'Officer', key: 'officer' }, { label: 'Priority', key: 'priority' }, { label: 'Last action', key: 'lastAction' }, { label: 'Next action', key: 'nextAction' }, { label: 'Last action date', key: 'lastDate' }, { label: 'Expected disposal', key: 'due' }, { label: 'Region', key: 'region' }, { label: 'Related cases', key: 'related' }, { label: 'SLA state', get: c => slaOf(c).label }])
  return <div className="space-y-3">
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1"><Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" /><input className={inputCls + ' pl-8'} placeholder="Search Case ID, institution, Permanent ID or text" value={f.search} onChange={e => set('search', e.target.value)} /></div>
        {sel('status', STATUSES, 'All statuses')}{sel('bureau', Object.keys(BUREAUS), 'All Bureaus/Cells')}{sel('region', REGIONS, 'All regions')}{sel('category', CATEGORIES, 'All categories')}{sel('priority', PRIORITIES, 'All priorities')}
        <label className="flex items-center gap-1 text-xs">From<input type="date" className={inputCls + ' !w-auto'} value={f.from} onChange={e => set('from', e.target.value)} /></label>
        <label className="flex items-center gap-1 text-xs">To<input type="date" className={inputCls + ' !w-auto'} value={f.to} onChange={e => set('to', e.target.value)} /></label>
        <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={f.overdue} onChange={e => set('overdue', e.target.checked)} />Overdue only</label>
        <Btn onClick={() => { setF({ search: '', status: '', bureau: '', region: '', category: '', priority: '', overdue: false, from: '', to: '' }); setPage(0) }}>Clear</Btn>
      </div>
      <div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-600">{rows.length} case(s)</span><div className="flex gap-2"><Btn onClick={exportCSV} disabled={!rows.length}><Download size={15} />Export CSV</Btn><Btn kind="primary" onClick={() => setUi(u => ({ ...u, form: { mode: 'add' } }))}><Plus size={15} />Add complaint</Btn></div></div>
    </Card>
    <Card className="!p-0 overflow-x-auto">
      {slice.length ? <table className="w-full text-sm"><thead className="border-b border-slate-200 bg-slate-50"><tr><Th k="id" sort={sort} setSort={setSort}>Case ID</Th><Th>Institution</Th><Th k="category" sort={sort} setSort={setSort}>Category</Th><Th k="status" sort={sort} setSort={setSort}>Status</Th><Th k="bureau" sort={sort} setSort={setSort}>Bureau</Th><Th k="priority" sort={sort} setSort={setSort}>Priority</Th><Th k="received" sort={sort} setSort={setSort}>Received</Th><Th k="sla" sort={sort} setSort={setSort}>Deadline</Th></tr></thead>
        <tbody>{slice.map(c => <tr key={c.id} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/40" onClick={() => openCase(c.id)}>
          <td className="px-3 py-2 font-medium text-blue-800">{c.id}{c.related.length > 0 && <span title="Linked cases" className="ml-1 text-xs">🔗</span>}</td><td className="max-w-56 px-3 py-2"><div className="truncate">{c.rawName}</div><div className="text-xs text-slate-500">{c.pid || 'ID not supplied'} · {c.region}</div></td><td className="px-3 py-2">{c.category}</td><td className="px-3 py-2"><Status s={c.status} /></td><td className="px-3 py-2"><Bureau b={c.bureau} /><div className="text-xs text-slate-500">{c.officer}</div></td><td className="px-3 py-2"><Prio p={c.priority} /></td><td className="px-3 py-2 text-xs">{fmtDate(c.received)}</td><td className="px-3 py-2"><SlaBadge x={slaOf(c)} /><div className="text-xs text-slate-500">{fmtDate(c.due)}</div></td></tr>)}</tbody></table> : <Empty text="No complaints match the current filters." />}
    </Card>
    <div className="flex items-center justify-between text-sm"><span>Page {cur + 1} of {pages}</span><div className="flex gap-2"><Btn disabled={cur === 0} onClick={() => setPage(cur - 1)}>Previous</Btn><Btn disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next</Btn></div></div>
  </div>
}
