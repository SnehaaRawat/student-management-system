import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const NAV_ITEMS = [
  { to: '/', label: 'Overview', end: true, roles: ['admin', 'teacher', 'student'] },
  { to: '/students', label: 'Students', roles: ['admin', 'teacher', 'student'] },
  { to: '/courses', label: 'Courses', roles: ['admin', 'teacher', 'student'] },
  { to: '/attendance', label: 'Attendance', roles: ['admin', 'teacher'] },
  { to: '/grades', label: 'Grades', roles: ['admin', 'teacher', 'student'] },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-ink/10 bg-white flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-ink/10">
          <p className="label-eyebrow">Register No. 01</p>
          <h1 className="text-2xl font-display font-semibold text-ink mt-1">Ledger</h1>
          <p className="text-sm text-slate mt-0.5">Student Management</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.filter((item) => item.roles.includes(user?.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink text-canvas' : 'text-slate hover:bg-ink/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-ink/10">
          <p className="text-sm font-medium text-ink">{user?.first_name || user?.username}</p>
          <p className="text-xs text-slate capitalize">{user?.role}</p>
          <button onClick={logout} className="mt-3 text-sm text-clay hover:underline">
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
