// Deterministic, rule-based overlap detection. No ML; heuristic scores only.
const ABBR = { inst: 'institute', instt: 'institute', engg: 'engineering', eng: 'engineering', tech: 'technology', coll: 'college', univ: 'university', mgmt: 'management', poly: 'polytechnic', sch: 'school' }
const NSTOP = new Set(['of', 'the', 'and', 'for', 'in', 'a', 'an'])
export const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean).map(w => ABBR[w] || w).filter(w => !NSTOP.has(w)).join('')
const bigrams = s => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1) } return m }
// Sørensen–Dice coefficient on character bigrams of normalised names
export function sim(a, b) {
  a = norm(a); b = norm(b)
  if (!a || !b) return 0
  if (a === b) return 1
  const A = bigrams(a), B = bigrams(b); let x = 0, t = 0
  A.forEach((v, k) => { x += Math.min(v, B.get(k) || 0); t += v }); B.forEach(v => { t += v })
  return t ? (2 * x) / t : 0
}
export function resolve(c, insts) {
  if (c.pid) { const i = insts.find(x => x.pid === c.pid); if (i) return { inst: i, method: 'id', score: 1 } }
  let best = null, bs = 0
  for (const i of insts) { const s = sim(c.rawName || '', i.name); if (s > bs) { bs = s; best = i } }
  return bs >= 0.75 && best ? { inst: best, method: 'name', score: bs } : null
}
const SYN = { labs: 'laboratory', lab: 'laboratory', laboratories: 'laboratory', insufficient: 'inadequate', shortage: 'inadequate', shortfall: 'inadequate', lacking: 'inadequate', deficient: 'inadequate', teachers: 'faculty', teaching: 'faculty', staff: 'faculty', unqualified: 'qualification', qualified: 'qualification', qualifications: 'qualification', credentials: 'qualification', admitted: 'admission', admissions: 'admission', refunds: 'refund', hostels: 'hostel' }
const TSTOP = new Set(['the', 'and', 'for', 'not', 'may', 'was', 'has', 'that', 'with', 'from', 'students', 'student', 'institution', 'reported', 'complaint', 'are', 'any', 'during', 'after', 'under', 'being', 'have', 'been', 'required', 'prescribed', 'meet', 'pending'])
const toks = s => new Set((s || '').toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !TSTOP.has(w)).map(w => SYN[w] || w.replace(/(ing|ed|es|s)$/, '')))
const GROUPS = [['Laboratory Facilities', 'Infrastructure'], ['Faculty Qualification', 'Faculty Shortage'], ['Admission Irregularity', 'Fee Refund']]
const related = (a, b) => GROUPS.some(g => g.includes(a) && g.includes(b))
export const THRESHOLD = 60
export const band = s => (s >= 80 ? 'High' : s >= 68 ? 'Medium' : 'Low')
export function computeOverlaps(cases, insts) {
  const by = {}
  cases.forEach(c => { if (c.status === 'Disposed') return; const r = resolve(c, insts); if (r) (by[r.inst.pid] ||= []).push({ c, r }) })
  const out = []
  Object.values(by).forEach(list => {
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const A = list[i], B = list[j]
      if (A.c.bureau === B.c.bureau) continue
      const signals = []; let score = 10
      signals.push({ label: `Both cases active in different Bureaus/Cells (${A.c.bureau} & ${B.c.bureau})`, pts: 10 })
      if (A.r.method === 'id' && B.r.method === 'id') { score += 40; signals.push({ label: `Same AICTE Permanent ID (${A.r.inst.pid})`, pts: 40 }) }
      else { score += 30; const s = Math.round(Math.min(A.r.score, B.r.score) * 100); signals.push({ label: `Similar institution name after normalisation (${s}% match) resolved to ${A.r.inst.pid}`, pts: 30 }) }
      if (A.c.category === B.c.category) { score += 25; signals.push({ label: `Same category: ${A.c.category}`, pts: 25 }) }
      else if (related(A.c.category, B.c.category)) { score += 20; signals.push({ label: `Related categories: ${A.c.category} ↔ ${B.c.category}`, pts: 20 }) }
      const ta = toks(A.c.desc), tb = toks(B.c.desc), shared = [...ta].filter(x => tb.has(x))
      const jac = shared.length / Math.max(1, new Set([...ta, ...tb]).size), pts = Math.min(25, Math.round(jac * 80))
      if (pts >= 5) { score += pts; signals.push({ label: `Shared complaint terms: ${shared.join(', ')}`, pts }) }
      if (score < THRESHOLD) continue
      const [a, b] = [A.c, B.c].sort((x, y) => x.id.localeCompare(y.id))
      out.push({ key: a.id + '|' + b.id, a: a.id, b: b.id, inst: A.r.inst, signals, score, band: band(score), sig: [a, b].map(c => c.status + c.bureau + c.desc).join('#') })
    }
  })
  return out.sort((x, y) => y.score - x.score)
}
