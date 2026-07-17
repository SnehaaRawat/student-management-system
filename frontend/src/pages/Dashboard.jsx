import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import client from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

const GRADE_COLORS = {
  'A+': '#5B7A63',
  A: '#5B7A63',
  B: '#B08D57',
  C: '#B08D57',
  D: '#B4553F',
  F: '#B4553F',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .get('/grades/dashboard-stats/')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  const chartData = stats
    ? Object.entries(stats.grade_distribution).map(([grade, count]) => ({ grade, count }))
    : []

  return (
    <div className="p-8 max-w-6xl">
      <p className="label-eyebrow">Overview</p>
      <h2 className="text-3xl font-display font-semibold text-ink mt-1">
        Welcome back, {user?.first_name || user?.username}
      </h2>
      <p className="text-slate mt-1">Here's how things stand today.</p>

      {loading ? (
        <p className="text-slate mt-8">Loading...</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <StatCard label="Active students" value={stats.total_students} />
            <StatCard label="Attendance rate" value={`${stats.attendance_rate}%`} />
            <StatCard
              label="Average score"
              value={stats.average_percentage != null ? `${stats.average_percentage}%` : '—'}
            />
          </div>

          <div className="card p-6 mt-6">
            <h3 className="font-display text-lg font-semibold text-ink mb-1">Grade distribution</h3>
            <p className="text-sm text-slate mb-4">Count of recorded grades by letter band.</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C2B3314" />
                <XAxis dataKey="grade" tick={{ fill: '#4B5D67', fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#4B5D67', fontSize: 13 }} />
                <Tooltip
                  contentStyle={{ borderRadius: 2, borderColor: '#1C2B331A', fontFamily: 'Inter' }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card p-5">
      <p className="label-eyebrow">{label}</p>
      <p className="text-3xl font-display font-semibold text-ink mt-2">{value}</p>
    </div>
  )
}
