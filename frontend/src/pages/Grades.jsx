import { useEffect, useState } from 'react'
import client from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Modal from '../components/Modal.jsx'

const EMPTY_FORM = { student: '', course: '', exam_name: '', marks_obtained: '', max_marks: 100, date: '' }

export default function Grades() {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin' || user?.role === 'teacher'

  const [grades, setGrades] = useState([])
  const [students, setStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    client.get('/grades/').then(({ data }) => setGrades(data.results ?? data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    if (canEdit) {
      client.get('/students/').then(({ data }) => setStudents(data.results ?? data))
    }
    client.get('/courses/').then(({ data }) => setCourses(data.results ?? data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditing('new'); setError('') }
  const close = () => setEditing(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await client.post('/grades/', form)
      close()
      load()
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Something went wrong.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this grade entry?')) return
    await client.delete(`/grades/${id}/`)
    load()
  }

  const gradeColor = (letter) =>
    ['A+', 'A'].includes(letter) ? 'text-moss' : ['B', 'C'].includes(letter) ? 'text-brass' : 'text-clay'

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Marks book</p>
          <h2 className="text-3xl font-display font-semibold text-ink mt-1">Grades</h2>
        </div>
        {canEdit && <button onClick={openCreate} className="btn-primary">+ Add grade</button>}
      </div>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              {canEdit && <th className="px-4 py-3 label-eyebrow">Student</th>}
              <th className="px-4 py-3 label-eyebrow">Course</th>
              <th className="px-4 py-3 label-eyebrow">Exam</th>
              <th className="px-4 py-3 label-eyebrow">Score</th>
              <th className="px-4 py-3 label-eyebrow">Grade</th>
              {canEdit && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate" colSpan={6}>Loading...</td></tr>
            ) : grades.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate" colSpan={6}>No grades recorded yet.</td></tr>
            ) : (
              grades.map((g) => (
                <tr key={g.id} className="border-t border-ink/10">
                  {canEdit && <td className="px-4 py-3">{g.student_name}</td>}
                  <td className="px-4 py-3">{g.course_name}</td>
                  <td className="px-4 py-3">{g.exam_name}</td>
                  <td className="px-4 py-3">{g.marks_obtained} / {g.max_marks} ({g.percentage}%)</td>
                  <td className={`px-4 py-3 font-semibold ${gradeColor(g.letter_grade)}`}>{g.letter_grade}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(g.id)} className="text-clay hover:underline">Delete</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title="Add grade" onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-clay">{error}</p>}
            <label className="block">
              <span className="label-eyebrow block mb-1">Student</span>
              <select className="input w-full" value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} required>
                <option value="">Select a student</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.roll_number})</option>)}
              </select>
            </label>
            <label className="block">
              <span className="label-eyebrow block mb-1">Course</span>
              <select className="input w-full" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                <option value="">Select a course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </label>
            <Field label="Exam name" value={form.exam_name} onChange={(v) => setForm({ ...form, exam_name: v })} required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marks obtained" type="number" value={form.marks_obtained} onChange={(v) => setForm({ ...form, marks_obtained: v })} required />
              <Field label="Max marks" type="number" value={form.max_marks} onChange={(v) => setForm({ ...form, max_marks: v })} required />
            </div>
            <Field label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={close} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, value, onChange, required, type = 'text' }) {
  return (
    <label className="block">
      <span className="label-eyebrow block mb-1">{label}</span>
      <input
        type={type}
        className="input w-full"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  )
}
