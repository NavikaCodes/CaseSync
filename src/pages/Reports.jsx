import { useState } from 'react'
import { Download } from 'lucide-react'
import { Card, Btn, inputCls } from '../components/common'
import { useApp } from '../store'
import { BUREAUS, REGIONS, STATUSES } from '../data/seed'
import { disposalRate, pct, ageing, monthly, countBy } from '../utils/analytics'
import { downloadCSV } from '../utils/csv'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
export default function Reports() {
  const { cases, slaOf, instMap, institutions, overlaps, rejected } = useApp()
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [bureau, setBureau] = useState('')
  const cs = cases.filter(c => (!from || c.received >= from) && (!to || c.received <= to) && (!bureau || c.bureau === bureau))
  const grp = (keys, f) => keys.map(k => { const g = cs.filter(c => f(c) === k), d = g.filter(c => c.status === 'Disposed').length; return { name: k, total: g.length, active: g.length - d, disposed: d, overdue: g.filter(c => slaOf(c).state === 'overdue').length, rate: pct(disposalRate(g)) } })
  const byB = grp(Object.keys(BUREAUS), c => c.bureau), byR = grp(REGIONS, c => c.region)
  const byI = institutions.map(i => { const g = cs.filter(c => instMap[c.id] === i.pid); return { name: i.name, pid: i.pid, total: g.length, active: g.filter(c => c.status !== 'Disposed').length, disposed: g.filter(c => c.status === 'Disposed').length } }).filter(x => x.total).sort((a, b) => b.total - a.total)
  const cols = [{ label: 'Name', key: 'name' }, { label: 'Total', key: 'total' }, { label: 'Active', key: 'active' }, { label: 'Disposed', key: 'disposed' }, { label: 'Overdue', key: 'overdue' }, { label: 'Disposal rate', key: 'rate' }]
  const T = ({ title, rows, file, c = cols }) => <Card title={title} action={<Btn onClick={() => downloadCSV(file, rows, c)}><Download size={14} />CSV</Btn>}><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs text-slate-600">{c.map(x => <th key={x.key} className="px-2 py-1">{x.label}</th>)}</tr></thead><tbody>{rows.map(r => <tr key={r.name} className="border-b border-slate-100">{c.map(x => <td key={x.key} className="px-2 py-1">{r[x.key]}</td>)}</tr>)}</tbody></table></div></Card>
  const st = STATUSES.map(s => ({ name: s, total: cs.filter(c => c.status === s).length }))
  const q = {}; cs.forEach(c => { const d = new Date(c.received + 'T00:00:00'); if (isNaN(d)) return; const k = `${d.getFullYear()} Q${Math.floor(d.getMonth() / 3) + 1}`; q[k] = (q[k] || 0) + 1 })
  return <div className="space-y-4">
    <Card><div className="flex flex-wrap items-center gap-2 text-sm"><label className="flex items-center gap-1">From<input type="date" className={inputCls + ' !w-auto'} value={from} onChange={e => setFrom(e.target.value)} /></label><label className="flex items-center gap-1">To<input type="date" className={inputCls + ' !w-auto'} value={to} onChange={e => setTo(e.target.value)} /></label><select className={inputCls + ' !w-auto'} value={bureau} onChange={e => setBureau(e.target.value)}><option value="">All Bureaus/Cells</option>{Object.keys(BUREAUS).map(b => <option key={b}>{b}</option>)}</select>
      <span className="ml-auto">Overall disposal rate: <b>{pct(disposalRate(cs))}</b> <span className="text-xs text-slate-500">(Disposed ÷ Total × 100; N/A if no complaints)</span></span></div></Card>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Bureau workload comparison (active vs disposed)"><div className="h-60"><ResponsiveContainer><BarChart data={byB}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="active" stackId="a" fill="#1d4ed8" /><Bar dataKey="disposed" stackId="a" fill="#059669" /></BarChart></ResponsiveContainer></div></Card>
      <Card title="Overlaps"><div className="grid grid-cols-3 gap-3 text-center">{[['Open', overlaps.filter(o => o.coord !== 'Resolved').length], ['Reviewed / linked', overlaps.filter(o => o.review === 'reviewed' || o.review === 'linked').length], ['Rejected', rejected.length]].map(([k, v]) => <div key={k} className="rounded-lg bg-slate-50 p-3"><div className="text-2xl font-semibold">{v}</div><div className="text-xs text-slate-500">{k}</div></div>)}</div></Card>
    </div>
    <T title="Bureau-wise" rows={byB} file="bureau_report.csv" />
    <T title="Region-wise" rows={byR} file="region_report.csv" />
    <T title="Status-wise" rows={st} file="status_report.csv" c={[{ label: 'Status', key: 'name' }, { label: 'Total', key: 'total' }]} />
    <T title="Pending-case ageing" rows={ageing(cs).map(a => ({ name: a.name, total: a.value }))} file="ageing_report.csv" c={[{ label: 'Age bucket', key: 'name' }, { label: 'Cases', key: 'total' }]} />
    <T title="Monthly trend" rows={monthly(cs).map(a => ({ name: a.name, total: a.value }))} file="monthly_report.csv" c={[{ label: 'Month', key: 'name' }, { label: 'Received', key: 'total' }]} />
    <T title="Quarterly trend" rows={Object.entries(q).sort().map(([name, total]) => ({ name, total }))} file="quarterly_report.csv" c={[{ label: 'Quarter', key: 'name' }, { label: 'Received', key: 'total' }]} />
    <T title="Institution-wise complaint history" rows={byI} file="institution_report.csv" c={[{ label: 'Institution', key: 'name' }, { label: 'Permanent ID', key: 'pid' }, { label: 'Total', key: 'total' }, { label: 'Active', key: 'active' }, { label: 'Disposed', key: 'disposed' }]} />
  </div>
}
