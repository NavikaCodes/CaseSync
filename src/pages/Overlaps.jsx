import { useState } from 'react'
import { Card, Btn, Banner, Empty, Status, Bureau } from '../components/common'
import Compare from '../components/Compare'
import { useApp } from '../store'
export default function Overlaps() {
  const { overlaps, rejected, allCases, A, go } = useApp()
  const [tab, setTab] = useState('pending'), [cmp, setCmp] = useState(null)
  const list = tab === 'rejected' ? rejected : overlaps.filter(o => tab === 'pending' ? o.review === 'pending' : o.review !== 'pending')
  const st = id => allCases.find(c => c.id === id)?.status
  const bu = id => allCases.find(c => c.id === id)?.bureau
  const tabs = [['pending', 'Needs review', overlaps.filter(o => o.review === 'pending').length], ['done', 'Reviewed / linked', overlaps.filter(o => o.review !== 'pending').length], ['rejected', 'Rejected', rejected.length]]
  return <div className="space-y-4">
    <Banner n={overlaps.filter(o => o.coord !== 'Resolved').length} />
    <p className="text-xs text-slate-600">Detection runs in your browser using fixed rules: matching institution (Permanent ID or fuzzy name), different Bureaus/Cells with active cases, related category, and shared complaint terms. The score is a <b>heuristic demo score</b>, not a validated AI probability. Officials decide.</p>
    <div className="flex gap-2">{tabs.map(([k, l, n]) => <Btn key={k} kind={tab === k ? 'primary' : 'default'} onClick={() => setTab(k)}>{l} ({n})</Btn>)}</div>
    {list.length === 0 && <Card><Empty text="Nothing in this list." /></Card>}
    {list.map(o => <Card key={o.key}>
      <div className="flex flex-wrap items-start justify-between gap-2"><div><div className="font-semibold">{o.inst.name} <span className="text-xs font-normal text-slate-500">{o.inst.pid}</span></div><div className="text-sm text-amber-800">Potential Overlapping Cases – Coordination Required</div></div>
        <div className="text-right text-xs"><div className="rounded bg-slate-100 px-2 py-1">Heuristic demo score: <b>{o.score}/100</b> ({o.band})</div><div className="mt-1 text-slate-500">Review: {o.review} · Coordination: {o.coord}</div></div></div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{[o.a, o.b].map(id => <div key={id} className="rounded-lg bg-slate-50 p-2 text-sm"><b>{id}</b> <Bureau b={bu(id)} /> <Status s={st(id) || 'Pending'} /></div>)}</div>
      <div className="mt-3 text-sm"><div className="mb-1 font-medium">Why matched</div><ul className="space-y-0.5">{o.signals.map((s, i) => <li key={i} className="flex gap-2"><span className="w-8 shrink-0 text-right text-xs font-semibold text-blue-700">+{s.pts}</span><span>{s.label}</span></li>)}</ul></div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn onClick={() => setCmp(o)}>Open side by side</Btn>
        {tab === 'rejected' ? <Btn onClick={() => A.ov(o, { review: 'pending' }, 'Overlap restored', `Rejected match ${o.a} / ${o.b} restored.`, 'Suggestion restored')}>Restore suggestion</Btn> : <>
          <Btn disabled={o.review === 'linked'} onClick={() => A.ov(o, { review: 'linked' }, 'Overlap linked', `Cases ${o.a} and ${o.b} linked.`, 'Cases linked')}>Link cases</Btn>
          <Btn disabled={o.review === 'reviewed'} onClick={() => A.ov(o, { review: 'reviewed' }, 'Overlap reviewed', `Match ${o.a} / ${o.b} marked reviewed.`, 'Marked as reviewed')}>Mark reviewed</Btn>
          <Btn onClick={() => A.ov(o, { review: 'rejected' }, 'Overlap rejected', `Match ${o.a} / ${o.b} rejected as not related.`, 'Match rejected')}>Reject match</Btn>
          <Btn kind="primary" onClick={() => go('coordination', { key: o.key })}>Open coordination workspace</Btn></>}
      </div></Card>)}
    {cmp && <Compare o={cmp} onClose={() => setCmp(null)} />}
  </div>
}
