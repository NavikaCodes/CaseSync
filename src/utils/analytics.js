import { ageDays } from './dates'
export const countBy = (arr, f) => arr.reduce((m, x) => { const k = f(x); m[k] = (m[k] || 0) + 1; return m }, {})
export const toRows = m => Object.entries(m).map(([name, value]) => ({ name, value }))
// Disposal rate = Disposed / Total × 100; null when there are no complaints.
export const disposalRate = cs => (cs.length ? (cs.filter(c => c.status === 'Disposed').length / cs.length) * 100 : null)
export const pct = v => (v == null ? 'N/A' : v.toFixed(1) + '%')
export function ageing(cs) {
  const b = { '0–7 d': 0, '8–15 d': 0, '16–30 d': 0, '31+ d': 0 }
  cs.filter(c => c.status !== 'Disposed').forEach(c => { const a = ageDays(c); b[a <= 7 ? '0–7 d' : a <= 15 ? '8–15 d' : a <= 30 ? '16–30 d' : '31+ d']++ })
  return toRows(b)
}
export function monthly(cs) {
  const m = {}
  cs.forEach(c => { const k = (c.received || '').slice(0, 7); if (k) m[k] = (m[k] || 0) + 1 })
  return Object.keys(m).sort().map(k => ({ name: new Date(k + '-01T00:00:00').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), value: m[k] }))
}
