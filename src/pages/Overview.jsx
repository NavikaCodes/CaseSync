import { Card, Status, Prio, SlaBadge, Banner } from '../components/common'
import { useApp } from '../store'
import { countBy, toRows, ageing, monthly } from '../utils/analytics'
import { fmtDate } from '../utils/dates'
import { STATUSES } from '../data/seed'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend } from 'recharts'
const COL = { Pending: '#d97706', 'Under Process': '#2563eb', Disposed: '#059669', Transferred: '#64748b', Escalated: '#dc2626' }
export default function Overview() {
  const { instMap, cases, overlaps, openOv, slaOf, go, openCase, institutions } = useApp()
  const cnt = s => cases.filter(c => c.status === s).length
  const overdue = cases.filter(c => slaOf(c).state === 'overdue')
  const kpis = [['Total Complaints', cases.length, {}, 'text-slate-900'], ['Pending', cnt('Pending'), { status: 'Pending' }, 'text-amber-700'], ['Under Process', cnt('Under Process'), { status: 'Under Process' }, 'text-blue-700'], ['Disposed', cnt('Disposed'), { status: 'Disposed' }, 'text-emerald-700'], ['Transferred', cnt('Transferred'), { status: 'Transferred' }, 'text-slate-700'], ['Escalated', cnt('Escalated'), { status: 'Escalated' }, 'text-red-700'], ['Overdue / Past SLA', overdue.length, { overdue: true }, 'text-red-700']]
  const status = STATUSES.map(s => ({ name: s, value: cnt(s) })).filter(x => x.value)
  const upcoming = cases.filter(c => slaOf(c).state === 'approaching')
  const recent = [...cases].sort((a, b) => b.lastDate.localeCompare(a.lastDate)).slice(0, 5)
  const attention = institutions.map(i => ({ i, n: cases.filter(c => instMap[c.id] === i.pid).length, bad: cases.filter(c => instMap[c.id] === i.pid && slaOf(c).state === 'overdue').length + overlaps.filter(o => o.inst.pid === i.pid && o.coord !== 'Resolved').length })).filter(x => x.bad).sort((a, b) => b.bad - a.bad).slice(0, 5)
  const li = 'flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50'
  return <div className="space-y-4">
    {openOv.length > 0 && <button className="block w-full text-left" onClick={() => go('coordination')}><Banner n={openOv.length} /></button>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {kpis.map(([l, v, f, c]) => <button key={l} onClick={() => go('complaints', f)} className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-blue-400"><div className="text-xs text-slate-500">{l}</div><div className={`text-3xl font-semibold ${c}`}>{v}</div></button>)}
      <button onClick={() => go('overlaps')} className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-left shadow-sm"><div className="text-xs text-amber-800">Open Overlaps</div><div className="text-3xl font-semibold text-amber-800">{openOv.length}</div></button>
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Status distribution"><div className="h-56"><ResponsiveContainer><PieChart><Pie data={status} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} onClick={d => go('complaints', { status: d.name })}>{status.map(s => <Cell key={s.name} fill={COL[s.name]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div></Card>
      <Card title="Complaints by Bureau/Cell"><div className="h-56"><ResponsiveContainer><BarChart data={toRows(countBy(cases, c => c.bureau))}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#1d4ed8" onClick={d => go('complaints', { bureau: d.name })} /></BarChart></ResponsiveContainer></div></Card>
      <Card title="Monthly trend (by date received)"><div className="h-56"><ResponsiveContainer><LineChart data={monthly(cases)}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Line dataKey="value" stroke="#1e3a8a" strokeWidth={2} /></LineChart></ResponsiveContainer></div></Card>
      <Card title="Pending-case ageing (non-disposed)"><div className="h-56"><ResponsiveContainer><BarChart data={ageing(cases)}><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="value" fill="#d97706" /></BarChart></ResponsiveContainer></div></Card>
      <Card title="Regional workload"><div className="h-56"><ResponsiveContainer><BarChart data={toRows(countBy(cases, c => c.region))} layout="vertical"><XAxis type="number" allowDecimals={false} /><YAxis type="category" dataKey="name" width={60} /><Tooltip /><Bar dataKey="value" fill="#0f766e" onClick={d => go('complaints', { region: d.name })} /></BarChart></ResponsiveContainer></div></Card>
      <Card title="High-priority alerts">{[...overdue, ...cases.filter(c => c.priority === 'High' && c.status === 'Escalated' && !overdue.includes(c))].slice(0, 5).map(c => <button key={c.id} className={li} onClick={() => openCase(c.id)}><span><b>{c.id}</b> <span className="text-slate-500">{c.rawName}</span></span><SlaBadge x={slaOf(c)} /></button>)}{!overdue.length && <p className="text-sm text-slate-500">No overdue cases.</p>}</Card>
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Cases approaching deadline (prototype threshold)">{upcoming.length ? upcoming.map(c => <button key={c.id} className={li} onClick={() => openCase(c.id)}><span><b>{c.id}</b> · {c.nextAction}</span><SlaBadge x={slaOf(c)} /></button>) : <p className="text-sm text-slate-500">None.</p>}</Card>
      <Card title="Open overlaps requiring coordination">{openOv.length ? openOv.slice(0, 5).map(o => <button key={o.key} className={li} onClick={() => go('overlaps')}><span><b>{o.inst.name}</b><br /><span className="text-xs text-slate-500">{o.a} ↔ {o.b}</span></span><span className="text-xs">Score {o.score}</span></button>) : <p className="text-sm text-slate-500">None.</p>}</Card>
      <Card title="Recently updated complaints">{recent.map(c => <button key={c.id} className={li} onClick={() => openCase(c.id)}><span><b>{c.id}</b> · {c.lastAction}</span><span className="flex items-center gap-2"><Status s={c.status} /><span className="text-xs text-slate-500">{fmtDate(c.lastDate)}</span></span></button>)}</Card>
      <Card title="Institutions requiring attention">{attention.length ? attention.map(({ i, n, bad }) => <button key={i.pid} className={li} onClick={() => go('institutions', { pid: i.pid })}><span><b>{i.name}</b><br /><span className="text-xs text-slate-500">{i.pid}</span></span><span className="text-xs">{n} cases · {bad} flags</span></button>) : <p className="text-sm text-slate-500">None.</p>}</Card>
    </div>
  </div>
}
