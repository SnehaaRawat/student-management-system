import { useEffect, useState } from 'react'
import client from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Modal from '../components/Modal.jsx'

const EMPTY_FORM = { code: '', name: '', description: '', credits: 3, teacher: '' }

export default function Courses() {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin'

  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    client.get('/courses/').then(({ data }) => setCourses(data.results ?? data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setForm(EMPTY_FORM); setEditing('new'); setError('') }
  const openEdit = (c) => { setForm({ ...c, teacher: c.teacher || '' }); setEditing(c.id); setError('') }
  const close = () => setEditing(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, teacher: form.teacher || null }
      if (editing === 'new') {
        await client.post('/courses/', payload)
      } else {
        await client.patch(`/courses/${editing}/`, payload)
      }
      close()
      load()
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Something went wrong.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this course?')) return
    await client.delete(`/courses/${id}/`)
    load()
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Catalog</p>
          <h2 className="text-3xl font-display font-semibold text-ink mt-1">Courses</h2>
        </div>
        {canEdit && <button onClick={openCreate} className="btn-primary">+ Add course</button>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {loading ? (
          <p className="text-slate">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-slate">No courses yet.</p>
        ) : (
          courses.map((c) => (
            <div key={c.id} className="card p-5">
              <p className="label-eyebrow">{c.code}</p>
              <h3 className="font-display text-lg font-semibold text-ink mt-1">{c.name}</h3>
              <p className="text-sm text-slate mt-1">{c.teacher_name || 'Unassigned'} · {c.credits} credits</p>
              <p className="text-sm text-slate mt-2">{c.enrolled_count} enrolled</p>
              {canEdit && (
                <div className="mt-4 flex gap-3">
                  <button onClick={() => openEdit(c)} className="text-brass text-sm hover:underline">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-clay text-sm hover:underline">Delete</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Add course' : 'Edit course'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-clay">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} required />
              <Field label="Credits" type="number" value={form.credits} onChange={(v) => setForm({ ...form, credits: v })} required />
            </div>
            <Field label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
            <Field label="Teacher (user ID)" value={form.teacher} onChange={(v) => setForm({ ...form, teacher: v })} />
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
