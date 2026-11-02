import { useState } from 'react'
import { LayoutDashboard, FileText, Building2, GitCompareArrows, Handshake, Timer, BarChart3, ScrollText, Settings as Cog, Bell, Menu, Search } from 'lucide-react'
import { useApp } from './store'
import Overview from './pages/Overview'
import Complaints from './pages/Complaints'
import Institutions from './pages/Institutions'
import Overlaps from './pages/Overlaps'
import Coordination from './pages/Coordination'
import SLA from './pages/SLA'
import Reports from './pages/Reports'
import Audit from './pages/Audit'
import Settings from './pages/Settings'
import CaseDrawer from './components/CaseDrawer'
import CaseForm from './components/CaseForm'
const NAV = [['overview', 'Overview', LayoutDashboard, Overview], ['complaints', 'All Complaints', FileText, Complaints], ['institutions', 'Institutions', Building2, Institutions], ['overlaps', 'Overlap Detection', GitCompareArrows, Overlaps], ['coordination', 'Coordination Center', Handshake, Coordination], ['sla', 'SLA & Escalations', Timer, SLA], ['reports', 'Reports & Analytics', BarChart3, Reports], ['audit', 'Audit Trail', ScrollText, Audit], ['settings', 'Settings / Demo Controls', Cog, Settings]]
export default function App() {
  const { nav, go, s, notifs, A, user, ui, toasts, openCase, openOv } = useApp()
  const [open, setOpen] = useState(false), [bell, setBell] = useState(false), [q, setQ] = useState('')
  const cur = NAV.find(n => n[0] === nav.page) || NAV[0], Page = cur[3]
  const unread = notifs.filter(n => !s.read.includes(n.id))
  return <div className="flex min-h-screen">
    <aside className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-[#0b1f4b] text-white transition-transform lg:static lg:translate-x-0 ${open ? '' : '-translate-x-full'}`}>
      <div className="px-5 py-5"><div className="text-xl font-bold tracking-wide">CASESYNC</div><div className="text-xs text-blue-200">One Institution. One Timeline. Coordinated Action.</div></div>
      <nav className="space-y-0.5 px-2">{NAV.map(([k, l, I]) => <button key={k} onClick={() => { go(k); setOpen(false) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${nav.page === k ? 'bg-blue-600 font-medium' : 'text-blue-100 hover:bg-white/10'}`}><I size={17} />{l}{k === 'overlaps' && openOv.length > 0 && <span className="ml-auto rounded-full bg-amber-400 px-1.5 text-xs font-semibold text-slate-900">{openOv.length}</span>}</button>)}</nav>
      <div className="absolute bottom-0 w-full p-4 text-xs text-blue-200">Team Polar_Pirates · S077<br />SIH 2026 prototype</div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <button className="lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}><Menu /></button>
        <h1 className="hidden text-base font-semibold sm:block">{cur[1]}</h1>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">SYNTHETIC DEMO DATA</span>
        <form className="relative ml-auto hidden max-w-xs flex-1 md:block" onSubmit={e => { e.preventDefault(); go('complaints', { search: q }) }}><Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search cases, institutions, IDs" className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-2 text-sm" /></form>
        <div className="relative"><button aria-label="Notifications" className="relative rounded-lg p-2 hover:bg-slate-100" onClick={() => setBell(!bell)}><Bell size={19} />{unread.length > 0 && <span className="absolute right-0.5 top-0.5 rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">{unread.length}</span>}</button>
          {bell && <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl border border-slate-200 bg-white shadow-xl"><div className="flex items-center justify-between border-b px-3 py-2 text-sm font-semibold">Notifications (in-app)<button className="text-xs font-normal text-blue-700" onClick={() => A.markRead('all')}>Mark all as read</button></div>
            <div className="max-h-96 overflow-y-auto">{notifs.length === 0 && <p className="p-4 text-sm text-slate-500">No notifications.</p>}{notifs.map(n => { const r = s.read.includes(n.id); return <div key={n.id} className={`flex gap-2 border-b border-slate-100 px-3 py-2 text-sm ${r ? 'text-slate-500' : 'bg-blue-50/50'}`}><button className="flex-1 text-left" onClick={() => { A.markRead(n.id); setBell(false); n.caseId ? openCase(n.caseId) : go(n.page) }}><b className="text-xs">{n.type}</b><br />{n.text}</button>{!r && <button className="text-xs text-blue-700" onClick={() => A.markRead(n.id)}>Read</button>}</div> })}</div></div>}</div>
        <div className="hidden text-right text-xs leading-tight sm:block"><div className="font-medium">{user.name}</div><div className="text-slate-500">Demo profile</div></div>
      </header>
      {s.role !== 'Management' && <div className="bg-blue-50 px-4 py-1.5 text-xs text-blue-900">Demo view: {s.role}{s.role === 'Regional Officer' ? ` — ${s.region} region` : ''}. This filters the display only; it is not access control.</div>}
      <main className="p-4 lg:p-6"><Page key={nav.k + nav.page} filter={nav.filter} /></main>
    </div>
    {ui.caseId && <CaseDrawer />}{ui.form && <CaseForm />}
    <div className="fixed bottom-4 right-4 z-[60] space-y-2">{toasts.map(t => <div key={t.id} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{t.m}</div>)}</div>
  </div>
}
