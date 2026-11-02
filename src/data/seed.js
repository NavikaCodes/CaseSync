import { isoOff } from '../utils/dates'
// ALL RECORDS ARE FICTIONAL SYNTHETIC DEMO DATA — not real AICTE records.
export const BUREAUS = { RB: 'Regulation Bureau (RB)', PGRC: 'PGRC', AB: 'Approval Bureau (AB)', RO: 'Regional Office (RO)' }
export const BCOLOR = { RB: '#1d4ed8', PGRC: '#7c3aed', AB: '#0f766e', RO: '#c2410c' }
export const OFFICERS = { RB: ['Rakesh Verma', 'Meera Nair'], PGRC: ['Anita Sharma', 'Suresh Iyer'], AB: ['Pooja Malhotra', 'Vikram Rao'], RO: ['Harpreet Singh', 'Lakshmi Menon'] }
export const CATEGORIES = ['Laboratory Facilities', 'Infrastructure', 'Faculty Qualification', 'Faculty Shortage', 'Fee Refund', 'Admission Irregularity', 'Approval/Affiliation', 'Academic Malpractice', 'Student Welfare']
export const STATUSES = ['Pending', 'Under Process', 'Disposed', 'Transferred', 'Escalated']
export const PRIORITIES = ['High', 'Normal', 'Low']
export const REGIONS = ['North', 'South', 'East', 'West', 'Central']
export const USERS = {
  'Management': { name: 'Demo Director (Management)', short: 'Management' },
  'RB Officer': { name: 'Demo RB Officer', short: 'RB Officer' },
  'PGRC Officer': { name: 'Demo PGRC Officer', short: 'PGRC Officer' },
  'Regional Officer': { name: 'Demo Regional Officer', short: 'Regional Officer' },
}
const I = (n, name, region, state, city, type) => ({ pid: 'DEMO-' + n, name, region, state, address: `Demo Campus Road, ${city}, ${state}`, type })
export const institutions = [
  I(1001, 'ABC Institute of Technology', 'North', 'Punjab', 'Amritsar', 'Engineering'),
  I(1002, 'Sunrise College of Engineering', 'South', 'Karnataka', 'Mysuru', 'Engineering'),
  I(1003, 'Greenfield Institute of Management', 'West', 'Maharashtra', 'Pune', 'Management'),
  I(1004, 'Kaveri Polytechnic', 'South', 'Tamil Nadu', 'Erode', 'Polytechnic'),
  I(1005, 'Himalaya School of Pharmacy', 'North', 'Himachal Pradesh', 'Solan', 'Pharmacy'),
  I(1006, 'Orion Technical University', 'Central', 'Madhya Pradesh', 'Bhopal', 'University'),
  I(1007, 'Lotus Institute of Architecture', 'East', 'West Bengal', 'Kolkata', 'Architecture'),
  I(1008, 'Narmada College of Technology', 'West', 'Gujarat', 'Vadodara', 'Engineering'),
  I(1009, 'Eastern Valley Institute of Engineering', 'East', 'Odisha', 'Bhubaneswar', 'Engineering'),
  I(1010, 'Sagar Polytechnic College', 'Central', 'Chhattisgarh', 'Raipur', 'Polytechnic'),
  I(1011, 'Deccan School of Applied Sciences', 'South', 'Telangana', 'Hyderabad', 'Applied Sciences'),
  I(1012, 'Malwa Institute of Pharmacy', 'North', 'Punjab', 'Bathinda', 'Pharmacy'),
  I(1013, 'Coastal Institute of Hotel Management', 'West', 'Goa', 'Panaji', 'Hotel Management'),
  I(1014, 'Brahmaputra Engineering Institute', 'East', 'Assam', 'Guwahati', 'Engineering'),
  I(1015, 'Pinnacle College of Computer Applications', 'Central', 'Uttar Pradesh', 'Lucknow', 'Computer Applications'),
]
// [id, pid, rawName(null=official), category, desc, status, bureau, officer, priority, receivedDaysAgo, dueInDays, lastAction, nextAction]
const ROWS = [
  ['PGRC-2026-001', 1001, null, 'Laboratory Facilities', 'Students reported insufficient laboratory equipment.', 'Under Process', 'PGRC', 'Anita Sharma', 'High', 34, 6, 'Notice sent seeking compliance report', 'Review institution reply'],
  ['RB-2026-014', 1001, null, 'Infrastructure', 'Institution may not meet prescribed laboratory requirements.', 'Escalated', 'RB', 'Rakesh Verma', 'High', 20, 2, 'Escalated to Deputy Director for inspection', 'Plan inspection visit'],
  ['PGRC-2026-002', 1001, null, 'Fee Refund', 'Caution deposit not returned to a student after withdrawal.', 'Pending', 'PGRC', 'Suresh Iyer', 'Normal', 12, 9, 'Acknowledgement sent', 'Seek institution response'],
  ['RB-2026-015', 1002, null, 'Faculty Qualification', 'Faculty appointed without prescribed qualifications.', 'Under Process', 'RB', 'Meera Nair', 'High', 25, 4, 'Faculty records requested', 'Verify submitted records'],
  ['PGRC-2026-003', null, 'Sun Rise Coll. of Engg', 'Faculty Shortage', 'Shortage of qualified teaching staff in civil department.', 'Pending', 'PGRC', 'Anita Sharma', 'Normal', 15, 11, 'Complaint logged', 'Assign for examination'],
  ['PGRC-2026-004', 1003, null, 'Fee Refund', 'Delay in refund of tuition fee to withdrawn candidates.', 'Under Process', 'PGRC', 'Suresh Iyer', 'Normal', 28, -5, 'Reminder sent to institution', 'Escalate if no reply'],
  ['RB-2026-016', 1003, null, 'Approval/Affiliation', 'Extension request for additional course intake.', 'Pending', 'RB', 'Rakesh Verma', 'Normal', 10, 20, 'File received', 'Initiate document check'],
  ['PGRC-2026-005', 1004, null, 'Student Welfare', 'Hostel mess hygiene concerns raised by students.', 'Under Process', 'PGRC', 'Anita Sharma', 'Normal', 18, 7, 'Inspection report requested', 'Review report'],
  ['PGRC-2026-006', 1004, null, 'Infrastructure', 'Library lacks adequate seating.', 'Pending', 'PGRC', 'Suresh Iyer', 'Low', 9, 12, 'Complaint logged', 'Seek response'],
  ['PGRC-2026-007', 1004, null, 'Admission Irregularity', 'Admission without publishing merit list.', 'Pending', 'PGRC', 'Anita Sharma', 'Normal', 22, -2, 'Reminder issued', 'Escalate to supervisor'],
  ['RB-2026-017', 1004, null, 'Approval/Affiliation', 'Annual compliance query closed after reply.', 'Disposed', 'RB', 'Meera Nair', 'Low', 60, -20, 'Disposed after satisfactory reply', 'None'],
  ['AB-2026-001', 1005, null, 'Approval/Affiliation', 'Application for intake enhancement under evaluation.', 'Under Process', 'AB', 'Pooja Malhotra', 'Normal', 30, 3, 'Expert committee consulted', 'Prepare recommendation'],
  ['PGRC-2026-008', 1005, null, 'Infrastructure', 'Hostel facilities inadequate for enrolled students.', 'Pending', 'PGRC', 'Suresh Iyer', 'Normal', 14, 14, 'Complaint logged', 'Seek response'],
  ['RO-2026-001', 1005, null, 'Infrastructure', 'Regional visit reported inadequate hostel capacity.', 'Under Process', 'RO', 'Harpreet Singh', 'Normal', 8, 10, 'Visit report filed', 'Share findings'],
  ['RB-2026-018', 1006, null, 'Faculty Qualification', 'Faculty lacking required qualifications in computer science.', 'Under Process', 'RB', 'Meera Nair', 'High', 40, -8, 'Show-cause notice issued', 'Evaluate reply'],
  ['RO-2026-002', 1006, null, 'Faculty Shortage', 'Shortage of teaching staff reported during visit.', 'Pending', 'RO', 'Lakshmi Menon', 'Normal', 11, 13, 'Visit note recorded', 'Forward to RB'],
  ['PGRC-2026-009', 1007, null, 'Academic Malpractice', 'Allegation of manipulated internal assessment marks.', 'Transferred', 'RB', 'Rakesh Verma', 'High', 26, 5, 'Transferred from PGRC to RB', 'Start examination'],
  ['PGRC-2026-010', 1007, null, 'Student Welfare', 'Counselling facilities absent.', 'Disposed', 'PGRC', 'Anita Sharma', 'Low', 70, -30, 'Disposed after compliance', 'None'],
  ['PGRC-2026-011', 1008, null, 'Admission Irregularity', 'Candidates admitted above sanctioned intake.', 'Escalated', 'PGRC', 'Suresh Iyer', 'High', 21, 1, 'Escalated to Head of Cell', 'Coordinate with RB'],
  ['RB-2026-019', 1008, null, 'Admission Irregularity', 'Admissions exceeding approved intake in two branches.', 'Under Process', 'RB', 'Meera Nair', 'High', 17, 6, 'Intake data requested', 'Analyse admission data'],
  ['AB-2026-002', 1008, null, 'Approval/Affiliation', 'Document verification for new lab block.', 'Pending', 'AB', 'Vikram Rao', 'Normal', 6, 15, 'Documents received', 'Verify documents'],
  ['PGRC-2026-012', 1009, null, 'Admission Irregularity', 'Irregularities in lateral entry admissions.', 'Pending', 'PGRC', 'Anita Sharma', 'Normal', 13, 8, 'Complaint logged', 'Seek response'],
  ['RB-2026-020', 1009, null, 'Laboratory Facilities', 'Equipment in electronics workshop is obsolete.', 'Under Process', 'RB', 'Rakesh Verma', 'Normal', 19, 5, 'Inspection scheduled', 'Conduct inspection'],
  ['RO-2026-003', 1010, null, 'Fee Refund', 'Fee refund delay at polytechnic.', 'Pending', 'RO', 'Harpreet Singh', 'Normal', 7, 14, 'Logged at regional office', 'Contact institution'],
  ['PGRC-2026-013', 1010, null, 'Fee Refund', 'Students awaiting refund of fees after migration.', 'Under Process', 'PGRC', 'Suresh Iyer', 'Normal', 24, -3, 'Reminder issued', 'Escalate'],
  ['RB-2026-021', 1011, null, 'Approval/Affiliation', 'Unauthorised change of campus location alleged.', 'Escalated', 'RB', 'Rakesh Verma', 'High', 33, -1, 'Escalated to Competent Authority', 'Await direction'],
  ['PGRC-2026-014', 1011, null, 'Student Welfare', 'Anti-ragging committee not constituted.', 'Under Process', 'PGRC', 'Anita Sharma', 'Normal', 16, 9, 'Clarification sought', 'Review clarification'],
  ['PGRC-2026-015', 1012, null, 'Faculty Qualification', 'Pharmacy faculty credentials questioned.', 'Pending', 'PGRC', 'Suresh Iyer', 'Normal', 5, 20, 'Complaint logged', 'Assign officer'],
  ['RB-2026-022', 1012, null, 'Faculty Shortage', 'Shortfall of faculty against norms.', 'Disposed', 'RB', 'Meera Nair', 'Low', 55, -15, 'Disposed after compliance', 'None'],
  ['AB-2026-003', 1013, null, 'Approval/Affiliation', 'Renewal of approval pending documents.', 'Pending', 'AB', 'Pooja Malhotra', 'Normal', 19, 3, 'Reminder sent', 'Follow up'],
  ['PGRC-2026-016', 1013, null, 'Infrastructure', 'Kitchen training facility not functional.', 'Under Process', 'PGRC', 'Anita Sharma', 'Normal', 9, 12, 'Photos requested', 'Review photos'],
  ['RB-2026-023', 1014, null, 'Academic Malpractice', 'Unfair means in semester examinations alleged.', 'Under Process', 'RB', 'Meera Nair', 'Normal', 23, 4, 'Reply sought from institution', 'Evaluate reply'],
  ['RO-2026-004', 1014, null, 'Student Welfare', 'Scholarship disbursement delays.', 'Pending', 'RO', 'Lakshmi Menon', 'Low', 4, 16, 'Logged', 'Contact institution'],
  ['PGRC-2026-017', 1015, null, 'Fee Refund', 'Excess fee collected during admission.', 'Pending', 'PGRC', 'Suresh Iyer', 'Normal', 3, 18, 'Complaint logged', 'Assign officer'],
  ['PGRC-2026-018', 1015, null, 'Infrastructure', 'Computer lab seating inadequate.', 'Disposed', 'PGRC', 'Anita Sharma', 'Low', 45, -10, 'Disposed after compliance', 'None'],
  ['AB-2026-004', 1015, null, 'Approval/Affiliation', 'Annual compliance report pending.', 'Transferred', 'AB', 'Vikram Rao', 'Normal', 12, 7, 'Transferred from RB to AB', 'Process report'],
]
const at = (daysAgo, hh) => `${isoOff(-daysAgo)}T${hh}:00`
export function seedCases() {
  return ROWS.map((r, i) => {
    const [id, pid, raw, category, desc, status, bureau, officer, priority, ago, dueIn, lastAction, nextAction] = r
    const inst = institutions.find(x => x.pid === 'DEMO-' + (pid || (id === 'PGRC-2026-003' ? 1002 : 0)))
    const lastAgo = Math.max(0, Math.min(ago - 1, 2 + ((i * 5) % 14)))
    const history = [{ ts: at(ago, '10:30'), bureau, officer, type: 'Complaint Received', remark: desc }]
    if (status !== 'Pending') history.push({ ts: at(lastAgo, '15:10'), bureau, officer, type: status === 'Transferred' ? 'Transfer' : status === 'Escalated' ? 'Escalation' : status === 'Disposed' ? 'Disposal' : 'Action', remark: lastAction })
    return { id, pid: pid ? 'DEMO-' + pid : null, rawName: raw || inst.name, category, desc, received: isoOff(-ago), status, bureau, officer, priority, lastAction, nextAction, lastDate: isoOff(-lastAgo), due: isoOff(dueIn), region: inst.region, related: [], history }
  }).map(c => {
    if (c.id === 'PGRC-2026-011') c.related = ['RB-2026-019']
    if (c.id === 'RB-2026-019') c.related = ['PGRC-2026-011']
    return c
  })
}
export function seedOv() {
  const t = new Date().toISOString().slice(0, 19)
  return {
    'PGRC-2026-003|RB-2026-015': { review: 'reviewed', coord: 'In Review', lead: 'RB', coordinator: 'Meera Nair', decision: 'RB to lead; PGRC to share complaint details.', notes: [{ ts: t, by: 'Demo RB Officer', text: 'Asked PGRC to share the complainant statements.' }], updated: t, sig: '' },
    'PGRC-2026-011|RB-2026-019': { review: 'linked', coord: 'Awaiting Action', lead: 'RB', coordinator: 'Rakesh Verma', decision: 'Cases linked; single reply to be sought from institution.', notes: [], updated: t, sig: '' },
  }
}
