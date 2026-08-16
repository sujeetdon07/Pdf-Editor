import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/compress-pdf', label: 'Compress PDF' },
  { to: '/jpg-to-pdf', label: 'Image to PDF' },
  { to: '/pdf-to-jpg', label: 'PDF to Image' },
  { to: '/merge-pdf', label: 'Merge' },
  { to: '/split-pdf', label: 'Split' },
  { to: '/rotate-pdf', label: 'Rotate' },
]

export default function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white">
              P
            </span>
            <span>
              PDF<span className="text-brand-500">Tools</span>
            </span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500">
          Everything runs locally in your browser — your files are never uploaded to a server.
        </div>
      </footer>
    </div>
  )
}
