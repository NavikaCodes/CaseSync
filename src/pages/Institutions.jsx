import { useMemo, useState } from 'react'
import { Card, Status, Prio, SlaBadge, Btn, inputCls, Th, Banner, Empty } from '../components/common'
import Timeline from '../components/Timeline'
import { useApp } from '../store'
import { REGIONS, PRIORITIES, BCOLOR } from '../data/seed'
import { fmtDate } from '../utils/dates'
import { sim } from '../utils/matching'
export default function Institutions({ filter }) {
  const { institutions, allCases, instMap, overlaps, slaOf, openCase, go, setUi } = useApp()
  const [pid, setPid] = useState(filter.pid || null), [q, setQ] = useState(''), [region, setRegion] = useState(''), [sort, setSort] = useState({ k: 'total', dir: 'desc' })
  const stats = useMemo(() => institutions.map(i => {
    const cs = allCases.filter(c => instMap[c.id] === i.pid), act = cs.filter(c => c.status !== 'Disposed')
    const hi = act.length ? PRIORITIES.find(p => act.some(c => c.priority === p)) : '—'
    return { ...i, cs, total: cs.length, active: act.length, bureaus: new Set(act.map(c => c.bureau)).size, hi, recent: cs.map(c => c.lastDate).sort().pop() || '' }
  }), [institutions, allCases, instMap])
  if (pid) {
    const i = stats.find(x => x.pid === pid); if (!i) return <Empty text="Institution not found." />
    const ov = overlaps.filter(o => o.inst.pid === pid && o.coord !== 'Resolved')
    const events = i.cs.flatMap(c => c.history.map(h => ({ ...h, caseId: c.id })))
    const similar = stats.filter(x => x.pid !== pid && sim(x.name, i.name) > 0.55)
    return <div className="space-y-4">
      <Btn onClick={() => setPid(null)}>← All institutions</Btn>
      <Card><h2 className="text-lg font-semibold">{i.name}</h2><p className="text-sm text-slate-600">{i.pid} · {i.type} · {i.state}, {i.region} Region</p><p className="text-sm text-slate-500">{i.address}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{[['Complaints', i.total], ['Active cases', i.active], ['Responsible Bureaus/Cells', [...new Set(i.cs.filter(c => c.status !== 'Disposed').map(c => c.bureau))].join(', ') || '—'], ['Highest priority', i.hi]].map(([k, v]) => <div key={k} className="rounded-lg bg-slate-50 p-3"><div className="text-xs text-slate-500">{k}</div><div className="font-semibold">{v}</div></div>)}</div></Card>
      {ov.map(o => <button key={o.key} className="block w-full text-left" onClick={() => go('overlaps')}><Banner /><div className="px-1 pt-1 text-xs text-slate-600">{o.a} ↔ {o.b} · heuristic score {o.score} · coordination: {o.coord}</div></button>)}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Related complaint records">{i.cs.map(c => <button key={c.id} onClick={() => openCase(c.id)} className="flex w-full items-center justify-between gap-2 border-b border-slate-100 py-2 text-left text-sm"><span><b>{c.id}</b> · {c.category}<br /><span className="text-xs text-slate-500">{c.desc}</span></span><Status s={c.status} /></button>)}</Card>
        <Card title="Pending deadlines">{i.cs.filter(c => c.status !== 'Disposed').sort((a, b) => a.due.localeCompare(b.due)).map(c => <div key={c.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-sm"><span>{c.id} · {fmtDate(c.due)}</span><SlaBadge x={slaOf(c)} /></div>)}
          {similar.length > 0 && <div className="mt-3 text-xs text-slate-500">Similar institution names (not merged automatically): {similar.map(s => s.name).join(', ')}</div>}</Card>
      </div>
      <Card title="One Institution, One Timeline"><p className="mb-3 text-xs text-slate-500">Every action from every Bureau/Cell on this institution, in chronological order and colour-coded by Bureau/Cell.</p><Timeline events={events} showCase /></Card>
    </div>
  }
  const rows = stats.filter(i => (!q || (i.name + i.pid + i.state).toLowerCase().includes(q.toLowerCase())) && (!region || i.region === region)).sort((a, b) => { const x = a[sort.k], y = b[sort.k]; return (x < y ? -1 : x > y ? 1 : 0) * (sort.dir === 'asc' ? 1 : -1) })
  return <div className="space-y-3">
    <Card><div className="flex flex-wrap gap-2"><input className={inputCls + ' !w-72'} placeholder="Search name, Permanent ID or state" value={q} onChange={e => setQ(e.target.value)} /><select className={inputCls + ' !w-auto'} value={region} onChange={e => setRegion(e.target.value)}><option value="">All regions</option>{REGIONS.map(r => <option key={r}>{r}</option>)}</select></div></Card>
    <Card className="!p-0 overflow-x-auto">{rows.length ? <table className="w-full text-sm"><thead className="border-b bg-slate-50"><tr><Th k="name" sort={sort} setSort={setSort}>Institution</Th><Th>Region / type</Th><Th k="total" sort={sort} setSort={setSort}>Complaints</Th><Th k="active" sort={sort} setSort={setSort}>Active</Th><Th k="bureaus" sort={sort} setSort={setSort}>Bureaus</Th><Th>Top priority</Th><Th k="recent" sort={sort} setSort={setSort}>Last activity</Th></tr></thead>
      <tbody>{rows.map(i => <tr key={i.pid} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50/40" onClick={() => setPid(i.pid)}><td className="px-3 py-2"><div className="font-medium text-blue-800">{i.name}</div><div className="text-xs text-slate-500">{i.pid} · {i.address}</div></td><td className="px-3 py-2">{i.region}, {i.state}<div className="text-xs text-slate-500">{i.type}</div></td><td className="px-3 py-2">{i.total}</td><td className="px-3 py-2">{i.active}</td><td className="px-3 py-2">{i.bureaus}</td><td className="px-3 py-2">{i.hi === '—' ? '—' : <Prio p={i.hi} />}</td><td className="px-3 py-2 text-xs">{i.recent ? fmtDate(i.recent) : '—'}</td></tr>)}</tbody></table> : <Empty text="No institutions match." />}</Card>
    <Btn onClick={() => setUi(u => ({ ...u, form: { mode: 'add' } }))}>Add complaint</Btn>
  </div>
}
