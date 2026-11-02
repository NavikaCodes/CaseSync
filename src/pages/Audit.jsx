import { useState } from 'react'
import { Card, inputCls, Empty, Btn } from '../components/common'
import { useApp } from '../store'
import { fmtTime } from '../utils/dates'
import { downloadCSV } from '../utils/csv'
export default function Audit() {
  const { s } = useApp(); const [q, setQ] = useState('')
  const rows = s.audit.filter(a => !q || Object.values(a).join(' ').toLowerCase().includes(q.toLowerCase()))
  return <div className="space-y-3"><Card><div className="flex gap-2"><input className={inputCls} placeholder="Search audit trail" value={q} onChange={e => setQ(e.target.value)} /><Btn disabled={!rows.length} onClick={() => downloadCSV('audit_trail.csv', rows, [{ label: 'Timestamp', key: 'ts' }, { label: 'Action', key: 'type' }, { label: 'Reference', key: 'ref' }, { label: 'User', key: 'user' }, { label: 'Description', key: 'desc' }])}>Export CSV</Btn></div></Card>
    <Card className="!p-0 overflow-x-auto">{rows.length ? <table className="w-full text-sm"><thead className="border-b bg-slate-50 text-left text-xs text-slate-600"><tr><th className="px-3 py-2">Time</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Reference</th><th className="px-3 py-2">User</th><th className="px-3 py-2">Description</th></tr></thead><tbody>{rows.map(a => <tr key={a.id} className="border-b border-slate-100 align-top"><td className="whitespace-nowrap px-3 py-2 text-xs">{fmtTime(a.ts)}</td><td className="px-3 py-2 font-medium">{a.type}</td><td className="px-3 py-2 text-xs">{a.ref}</td><td className="px-3 py-2 text-xs">{a.user}</td><td className="px-3 py-2">{a.desc}</td></tr>)}</tbody></table> : <Empty text="No audit entries match." />}</Card></div>
}
