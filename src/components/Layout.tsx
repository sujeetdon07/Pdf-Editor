import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/compress-pdf', label: 'Compress', glyph: '⤓' },
  { to: '/jpg-to-pdf', label: 'Image → PDF', glyph: '▣' },
  { to: '/pdf-to-jpg', label: 'PDF → Image', glyph: '◫' },
  { to: '/merge-pdf', label: 'Merge', glyph: '⧉' },
  { to: '/split-pdf', label: 'Split', glyph: '⑂' },
  { to: '/rotate-pdf', label: 'Rotate', glyph: '↻' },
]

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-iris-500/15 text-white ring-1 ring-inset ring-iris-500/50'
      : 'text-ink-300 hover:bg-ink-850 hover:text-white'
  }`
}

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-3">
      <img src="/logo.svg" alt="" className="h-9 w-9" />
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Cello<span className="text-mint-400">PDF</span>
      </span>
    </Link>
  )
}

export default function Layout() {
  return (
    <div className="min-h-full lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-ink-800 bg-ink-900/60 lg:flex lg:h-screen lg:sticky lg:top-0 lg:flex-col lg:gap-8 lg:px-5 lg:py-6">
        <Wordmark />
        <nav className="flex flex-col gap-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-ink-500">
            Workbench
          </p>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <span aria-hidden className="text-base text-iris-300">
                {item.glyph}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-ink-800 bg-ink-950/60 p-3 text-xs leading-relaxed text-ink-300">
          <span className="font-semibold text-mint-400">Offline by design.</span> Every file is
          processed by your own browser — nothing is uploaded.
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-ink-800 bg-ink-950/85 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Wordmark />
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-ink-800 px-4 py-6 text-xs text-ink-500 sm:px-8">
          CelloPDF · client-side PDF workbench · no accounts, no uploads, no tracking
        </footer>
      </div>
    </div>
  )
}
