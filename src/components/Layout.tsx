import { useState, useEffect } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/Auth'
import { Role } from '../types'

export const nav: { to: string; label: string; roles: Role[]; group?: string }[] = [
  { to: '/', label: 'Dashboard', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Overview' },
  { to: '/members', label: 'Members', roles: ['admin', 'staff', 'trainer'], group: 'Operations' },
  { to: '/plans', label: 'Membership plans', roles: ['admin', 'staff'], group: 'Operations' },
  { to: '/payments', label: 'Payments', roles: ['admin', 'staff', 'member'], group: 'Operations' },
  { to: '/attendance', label: 'Attendance', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Operations' },
  { to: '/dues', label: 'Pending dues', roles: ['admin', 'staff'], group: 'Operations' },
  { to: '/classes', label: 'Classes', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Training' },
  { to: '/trainers', label: 'Trainers', roles: ['admin', 'staff'], group: 'Training' },
  { to: '/workouts', label: 'Workout & diet', roles: ['admin', 'trainer', 'member'], group: 'Training' },
  { to: '/generator', label: 'Plan generator', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Training' },
  { to: '/progress', label: 'Progress', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Engage' },
  { to: '/rewards', label: 'Rewards', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Engage' },
  { to: '/crowd', label: 'Crowd meter', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Engage' },
  { to: '/facilities', label: 'Equipment & lockers', roles: ['admin', 'staff', 'trainer'], group: 'Studio' },
  { to: '/offers', label: 'Offers & referrals', roles: ['admin', 'staff', 'member'], group: 'Studio' },
  { to: '/feedback', label: 'Trainer feedback', roles: ['admin', 'staff', 'trainer', 'member'], group: 'Studio' },
  { to: '/reminders', label: 'Reminders', roles: ['admin', 'staff'], group: 'Studio' },
  { to: '/reports', label: 'Reports', roles: ['admin'], group: 'Insights' },
]

const ICONS: Record<string, JSX.Element> = {
  '/': <><rect x="3" y="3" width="7" height="9" rx="1.6" /><rect x="14" y="3" width="7" height="5" rx="1.6" /><rect x="14" y="12" width="7" height="9" rx="1.6" /><rect x="3" y="16" width="7" height="5" rx="1.6" /></>,
  '/members': <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8" /><path d="M18 14.3c2 .7 3.5 2.6 3.5 5.7" /></>,
  '/plans': <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18" /><path d="M7 15h4" /></>,
  '/payments': <><circle cx="12" cy="12" r="9" /><path d="M8.5 8h7M8.5 11h7M10 8c3.6 0 3.6 5 0 5H8.5l6 4" /></>,
  '/attendance': <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /><path d="m9 15 2 2 4-4" /></>,
  '/dues': <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  '/classes': <><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M8 2.5v4M16 2.5v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
  '/trainers': <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="m16.5 11 2 2 4-4" /></>,
  '/workouts': <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" />,
  '/generator': <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
  '/progress': <><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>,
  '/rewards': <><path d="M8 4h8v6a4 4 0 0 1-8 0z" /><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4" /><path d="M12 14v4M8.5 20h7" /></>,
  '/crowd': <path d="M3 12h4l3-8 4 16 3-8h4" />,
  '/facilities': <><rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  '/offers': <><path d="M3 12.5V4h8.5L21 13.5 13.5 21z" /><circle cx="7.5" cy="8.5" r="1.2" /></>,
  '/feedback': <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-5 4z" />,
  '/reminders': <><path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 21h4" /></>,
  '/reports': <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
}

function NavIcon({ to }: { to: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
      {ICONS[to] ?? <circle cx="12" cy="12" r="4" />}
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [menu, setMenu] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => { setMenu(false) }, [pathname])

  const toggleTheme = () => {
    const n = !dark
    setDark(n)
    document.documentElement.classList.toggle('dark', n)
    try { localStorage.setItem('mh-theme', n ? 'dark' : 'light') } catch { /* */ }
  }

  if (!user) return <Navigate to="/login" replace />

  const items = nav.filter(n => n.roles.includes(user.role))
  const groups: { name: string; items: typeof items }[] = []
  for (const item of items) {
    const g = item.group || 'Menu'
    const last = groups[groups.length - 1]
    if (!last || last.name !== g) groups.push({ name: g, items: [item] })
    else last.items.push(item)
  }

  const pageTitle = items.find(n => n.to === '/' ? pathname === '/' : pathname === n.to || pathname.startsWith(n.to + '/'))?.label
    || (pathname.startsWith('/members/') ? 'Member profile' : 'Studio')

  return (
    <div className="app-shell flex h-screen overflow-hidden">
      {menu && (
        <div className="fixed inset-0 bg-pine/60 backdrop-blur-sm z-20 lg:hidden no-print" onClick={() => setMenu(false)} />
      )}

      {/* Floating glass sidebar — more spacious */}
      <aside
        className={`fixed lg:relative top-0 left-0 z-30 w-[288px] shrink-0 flex flex-col overflow-hidden
          h-full rounded-none text-white
          bg-gradient-to-b from-pine via-pine2 to-pine3
          border-r border-white/10
          transform transition-transform duration-300 ease-out no-print
          ${menu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="pointer-events-none absolute -top-16 -right-10 w-52 h-52 rounded-full bg-brass/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 -left-10 w-48 h-48 rounded-full bg-iris/25 blur-3xl" />

        <div className="relative px-5 pt-[clamp(18px,3vh,28px)] pb-[clamp(12px,2vh,18px)]">
          <div className="flex items-center gap-3.5">
            <div className="brand-badge">
              <span><b>M</b><i>&amp;</i><b>H</b></span>
            </div>
            <div className="min-w-0">
              <div className="brand-name">Muscle &amp; Hustle</div>
              <div className="brand-tag"><em />Gym Studio<em /></div>
            </div>
          </div>
          <div className="brand-rule mt-[clamp(12px,2vh,18px)]" />
        </div>

        <nav className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden no-scrollbar px-3.5 pb-4">
          {groups.map(g => (
            <div key={g.name} style={{ marginTop: 'clamp(10px, 2vh, 22px)' }}>
              <div className="px-3.5 flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/60" style={{ height: 'clamp(20px, 2.8vh, 28px)' }}>
                {g.name}
              </div>
              <div className="space-y-1">
                {g.items.map(n => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === '/'}
                    style={{ height: 'clamp(36px, 4.8vh, 48px)' }}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3.5 rounded-xl px-3.5 text-[14px] font-semibold transition-colors duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-[#D93A17] to-[#B8215A] text-white shadow-glow'
                        : 'text-white/80 hover:text-white hover:bg-white/10'}`
                    }
                  >
                    <NavIcon to={n.to} />
                    <span className="truncate">{n.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative mx-3.5 mb-5 mt-3 rounded-xl border border-white/15 bg-white/[0.08] backdrop-blur px-3.5 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-volt text-pine grid place-items-center font-display font-extrabold shrink-0">{user.name[0]}</div>
          <div className="min-w-0">
            <div className="text-sm font-bold truncate leading-tight">{user.name}</div>
            <div className="text-[11px] text-brass3 capitalize leading-tight mt-0.5">{user.role}</div>
          </div>
        </div>
      </aside>

      <div className="app-scroll flex-1 flex flex-col min-w-0 h-full overflow-y-auto overflow-x-hidden">
        {/* Top header — more spacious */}
        <header className="sticky top-0 z-10 h-[76px] rounded-none bg-white/80 dark:bg-[#160E29]/85 backdrop-blur-xl border-b border-line flex items-center justify-between gap-4 px-5 sm:px-8 no-print">
          <div className="flex items-center gap-3.5 min-w-0">
            <button
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              className="lg:hidden bg-pine text-white rounded-xl px-3.5 py-2 text-sm font-semibold"
            >
              Menu
            </button>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.2em] text-brass2 font-bold hidden sm:block mb-0.5">Studio console</div>
              <div className="font-display text-xl font-bold truncate leading-tight">{pageTitle}</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <input
              className="input max-w-[260px] !py-2.5 !text-sm hidden md:block !rounded-xl"
              placeholder="Search members, payments…"
            />
            <button
              onClick={toggleTheme}
              className="text-sm whitespace-nowrap bg-paper2 dark:bg-white/10 rounded-xl px-5 py-2.5 font-semibold hover:ring-2 hover:ring-iris/30 transition-all"
            >
              {dark ? 'Light' : 'Dark'}
            </button>
            <button
              onClick={logout}
              className="text-sm whitespace-nowrap bg-pine text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-brass transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Main content — more breathing room on every page */}
        <main className="p-5 sm:p-8 lg:p-10 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
