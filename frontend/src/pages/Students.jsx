import { useEffect, useState } from 'react'
import client from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import Modal from '../components/Modal.jsx'

const EMPTY_FORM = {
  roll_number: '', first_name: '', last_name: '', grade_level: '',
  section: '', guardian_name: '', guardian_phone: '', address: '',
}

export default function Students() {
  const { user } = useAuth()
  const canEdit = user?.role === 'admin'

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  const load = (query = '') => {
    setLoading(true)
    client
      .get('/students/', { params: query ? { search: query } : {} })
      .then(({ data }) => setStudents(data.results ?? data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    load(search)
  }

  const openCreate = () => { setForm(EMPTY_FORM); setEditing('new'); setError('') }
  const openEdit = (s) => { setForm(s); setEditing(s.id); setError('') }
  const close = () => setEditing(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing === 'new') {
        await client.post('/students/', form)
      } else {
        await client.patch(`/students/${editing}/`, form)
      }
      close()
      load(search)
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Something went wrong.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this student record?')) return
    await client.delete(`/students/${id}/`)
    load(search)
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow">Roster</p>
          <h2 className="text-3xl font-display font-semibold text-ink mt-1">Students</h2>
        </div>
        {canEdit && (
          <button onClick={openCreate} className="btn-primary">+ Add student</button>
        )}
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-sm">
        <input
          className="input flex-1"
          placeholder="Search by name or roll no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn-ghost">Search</button>
      </form>

      <div className="card mt-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left">
            <tr>
              <th className="px-4 py-3 label-eyebrow">Roll No.</th>
              <th className="px-4 py-3 label-eyebrow">Name</th>
              <th className="px-4 py-3 label-eyebrow">Grade</th>
              <th className="px-4 py-3 label-eyebrow">Section</th>
              {canEdit && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-slate" colSpan={5}>Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td className="px-4 py-6 text-slate" colSpan={5}>No students found.</td></tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-medium">{s.roll_number}</td>
                  <td className="px-4 py-3">{s.first_name} {s.last_name}</td>
                  <td className="px-4 py-3">{s.grade_level}</td>
                  <td className="px-4 py-3">{s.section}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right space-x-3">
                      <button onClick={() => openEdit(s)} className="text-brass hover:underline">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-clay hover:underline">Delete</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Add student' : 'Edit student'} onClose={close}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && <p className="text-sm text-clay">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Roll number" value={form.roll_number} onChange={(v) => setForm({ ...form, roll_number: v })} required />
              <Field label="Grade level" value={form.grade_level} onChange={(v) => setForm({ ...form, grade_level: v })} required />
              <Field label="First name" value={form.first_name} onChange={(v) => setForm({ ...form, first_name: v })} required />
              <Field label="Last name" value={form.last_name} onChange={(v) => setForm({ ...form, last_name: v })} required />
              <Field label="Section" value={form.section} onChange={(v) => setForm({ ...form, section: v })} />
              <Field label="Guardian phone" value={form.guardian_phone} onChange={(v) => setForm({ ...form, guardian_phone: v })} />
            </div>
            <Field label="Guardian name" value={form.guardian_name} onChange={(v) => setForm({ ...form, guardian_name: v })} />
            <Field label="Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
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

function Field({ label, value, onChange, required }) {
  return (
    <label className="block">
      <span className="label-eyebrow block mb-1">{label}</span>
      <input
        className="input w-full"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  )
}
