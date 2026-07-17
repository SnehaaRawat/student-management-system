import { useEffect, useState } from 'react'
import client from '../api/client.js'

const STATUSES = ['present', 'absent', 'late']
const today = () => new Date().toISOString().slice(0, 10)

export default function Attendance() {
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [courseId, setCourseId] = useState('')
  const [date, setDate] = useState(today())
  const [marks, setMarks] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    client.get('/courses/').then(({ data }) => {
      const list = data.results ?? data
      setCourses(list)
      if (list.length) setCourseId(String(list[0].id))
    })
  }, [])

  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    client
      .get('/courses/enrollments/', { params: { course: courseId } })
      .then(({ data }) => {
        const list = data.results ?? data
        setStudents(list.map((e) => ({ id: e.student, name: e.student_name })))
        setMarks(Object.fromEntries(list.map((e) => [e.student, 'present'])))
      })
      .finally(() => setLoading(false))
  }, [courseId])

  const setMark = (studentId, status) => setMarks((m) => ({ ...m, [studentId]: status }))

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      await client.post('/attendance/bulk_mark/', {
        course: courseId,
        date,
        records: Object.entries(marks).map(([student, status]) => ({ student, status })),
      })
      setMessage('Attendance saved.')
    } catch (err) {
      setMessage('Could not save attendance.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <p className="label-eyebrow">Roll call</p>
      <h2 className="text-3xl font-display font-semibold text-ink mt-1">Attendance</h2>

      <div className="flex gap-4 mt-6 items-end">
        <label className="block">
          <span className="label-eyebrow block mb-1">Course</span>
          <select className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code} — {c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label-eyebrow block mb-1">Date</span>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>

      <div className="card mt-6 divide-y divide-ink/10">
        {loading ? (
          <p className="p-4 text-slate">Loading roster...</p>
        ) : students.length === 0 ? (
          <p className="p-4 text-slate">No students enrolled in this course.</p>
        ) : (
          students.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-ink">{s.name}</span>
              <div className="flex gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setMark(s.id, status)}
                    className={`px-3 py-1 text-xs rounded-sm capitalize border transition-colors ${
                      marks[s.id] === status
                        ? status === 'present'
                          ? 'bg-moss text-white border-moss'
                          : status === 'late'
                          ? 'bg-brass text-white border-brass'
                          : 'bg-clay text-white border-clay'
                        : 'border-ink/15 text-slate hover:bg-ink/5'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {students.length > 0 && (
        <div className="mt-4 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save attendance'}
          </button>
          {message && <span className="text-sm text-slate">{message}</span>}
        </div>
      )}
    </div>
  )
}
