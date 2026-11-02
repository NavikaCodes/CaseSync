import { BCOLOR, BUREAUS } from '../data/seed'
import { fmtTime } from '../utils/dates'
export default function Timeline({ events, showCase }) {
  const ev = [...events].sort((a, b) => String(a.ts).localeCompare(String(b.ts)))
  return <div>
    <div className="mb-3 flex flex-wrap gap-3 text-xs">{Object.keys(BCOLOR).map(b => <span key={b} className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: BCOLOR[b] }} />{BUREAUS[b]}</span>)}</div>
    <ol className="space-y-3 border-l-2 border-slate-200 pl-4">
      {ev.map((e, i) => <li key={i} className="relative rounded-lg border border-slate-200 bg-white p-3 text-sm" style={{ borderLeft: `4px solid ${BCOLOR[e.bureau] || '#64748b'}` }}>
        <span className="absolute -left-[25px] top-4 h-3 w-3 rounded-full border-2 border-white" style={{ background: BCOLOR[e.bureau] || '#64748b' }} />
        <div className="flex flex-wrap items-center justify-between gap-1"><span className="font-medium">{e.type}{showCase && e.caseId ? ` · ${e.caseId}` : ''}</span><span className="text-xs text-slate-500">{fmtTime(e.ts)}</span></div>
        <div className="text-xs text-slate-500">{e.bureau} · {e.officer}</div>
        <div className="mt-1 text-slate-700">{e.remark}</div></li>)}
    </ol></div>
}
