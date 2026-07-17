import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Could not sign in. Check your details.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-canvas">
      <div className="hidden md:flex flex-col justify-between bg-ink text-canvas px-12 py-10">
        <p className="label-eyebrow text-canvas/60">Register No. 01</p>
        <div>
          <h1 className="text-5xl font-display font-semibold leading-tight">
            Ledger
          </h1>
          <p className="mt-4 text-canvas/70 max-w-sm">
            A calm, orderly record of every student, class, and mark —
            kept the way a good registrar keeps a ledger: current, correct, and easy to open.
          </p>
        </div>
        <p className="text-sm text-canvas/40">Student Management System</p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm card p-8">
          <h2 className="text-2xl font-display font-semibold text-ink">Sign in</h2>
          <p className="text-sm text-slate mt-1 mb-6">Enter your credentials to open the register.</p>

          {error && (
            <p className="text-sm text-clay bg-clay/10 border border-clay/20 rounded-sm px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <label className="label-eyebrow block mb-1">Username</label>
          <input
            className="input w-full mb-4"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />

          <label className="label-eyebrow block mb-1">Password</label>
          <input
            type="password"
            className="input w-full mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-xs text-slate mt-4">
            Demo: admin / admin123 or teacher1 / teacher123 (after running seed_demo_data)
          </p>
        </form>
      </div>
    </div>
  )
}
