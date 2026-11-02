const p = n => String(n).padStart(2, '0')
export const fmtISO = d => `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
export const isoOff = n => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + n); return fmtISO(d) }
export const diffDays = (a, b) => {
  const A = new Date(a + 'T00:00:00'), B = new Date(b + 'T00:00:00')
  return isNaN(A) || isNaN(B) ? null : Math.round((A - B) / 864e5)
}
export const fmtDate = s => { const d = new Date(String(s).length === 10 ? s + 'T00:00:00' : s); return isNaN(d) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
export const fmtTime = s => { const d = new Date(s); return isNaN(d) ? '—' : d.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }
// Prototype thresholds only — NOT official AICTE timelines.
export function sla(c, approach = 3) {
  if (c.status === 'Disposed') return { state: 'closed', days: null, label: 'Closed' }
  const r = diffDays(c.due, isoOff(0))
  if (r === null) return { state: 'unknown', days: null, label: 'No date' }
  if (r < 0) return { state: 'overdue', days: -r, label: `${-r}d overdue` }
  if (r <= approach) return { state: 'approaching', days: r, label: r === 0 ? 'Due today' : `Due in ${r}d` }
  return { state: 'ok', days: r, label: `${r}d left` }
}
export const ageDays = c => Math.max(0, diffDays(isoOff(0), c.received) ?? 0)
