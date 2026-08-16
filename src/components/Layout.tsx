import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV_GROUPS, PAGES, SITE, TOOLS } from '../content/site'
import { AD_SLOTS, adsEnabled } from '../lib/ads'
import { resetConsent } from '../lib/consent'
import AdSlot from './AdSlot'
import ConsentBanner from './ConsentBanner'
import StatsBand from './StatsBand'

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
      <img src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9" />
      <span className="font-display text-lg font-bold tracking-tight text-white">
        Cello<span className="text-mint-400">PDF</span>
      </span>
    </Link>
  )
}

function ToolNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Tools" className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-ink-500">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavLink key={item.path} to={item.path} className={navLinkClass} onClick={onNavigate}>
              <span aria-hidden className="text-base text-iris-300">
                {item.glyph}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5" fill="none" stroke="currentColor">
      {open ? (
        <path strokeWidth="2" strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path strokeWidth="2" strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  )
}

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setIsMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <div className="min-h-full lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r border-ink-800 bg-ink-900/60 lg:flex lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:gap-8 lg:overflow-y-auto lg:px-5 lg:py-6">
        <Wordmark />
        <ToolNav />
        <div className="mt-auto rounded-xl border border-ink-800 bg-ink-950/60 p-3 text-xs leading-relaxed text-ink-300">
          <span className="font-semibold text-mint-400">Offline by design.</span> Every file is
          processed by your own browser — nothing is uploaded.
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-8">
            <div className="lg:hidden">
              <Wordmark />
            </div>
            <nav aria-label="Site" className="hidden gap-1 lg:flex">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              {PAGES.map((page) => (
                <NavLink key={page.path} to={page.path} className={navLinkClass}>
                  {page.label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden items-center gap-2 text-xs text-ink-500 lg:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
              No uploads
            </div>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="btn-ghost flex items-center gap-2 lg:hidden"
            >
              <MenuIcon open={isMenuOpen} />
              Menu
            </button>
          </div>
        </header>

        {isMenuOpen ? (
          <div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[61px] z-20 overflow-y-auto border-t border-ink-800 bg-ink-950 px-4 py-5 lg:hidden"
          >
            <ToolNav onNavigate={() => setIsMenuOpen(false)} />
            <nav aria-label="Site" className="mt-6 flex flex-col gap-1 border-t border-ink-800 pt-5">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              {PAGES.map((page) => (
                <NavLink key={page.path} to={page.path} className={navLinkClass}>
                  {page.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8">
          <Outlet />
        </main>

        <AdSlot
          slot={AD_SLOTS.footer}
          className="mx-auto w-full max-w-5xl px-4 pb-4 sm:px-8"
        />

        <StatsBand />

        <footer className="border-t border-ink-800 bg-ink-950/60">
          <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <Wordmark />
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-500">
                {SITE.tagline}. Compress, convert and edit documents without uploading a single
                byte.
              </p>
            </div>
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">
                  {group.label}
                </p>
                <ul className="mt-3 space-y-2">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <Link to={item.path} className="text-xs text-ink-300 hover:text-white">
                        {item.heading}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-500">Site</p>
              <ul className="mt-3 space-y-2">
                {PAGES.map((page) => (
                  <li key={page.path}>
                    <Link to={page.path} className="text-xs text-ink-300 hover:text-white">
                      {page.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href="/sitemap.xml" className="text-xs text-ink-300 hover:text-white">
                    Sitemap
                  </a>
                </li>
                {adsEnabled() ? (
                  <li>
                    <button
                      type="button"
                      className="text-xs text-ink-300 hover:text-white"
                      onClick={resetConsent}
                    >
                      Cookie choices
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
          <div className="border-t border-ink-800 px-4 py-5 text-xs text-ink-500 sm:px-8">
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-2">
              <span>
                {`© ${new Date().getFullYear()} ${SITE.name} · ${TOOLS.length} tools · no accounts, no uploads${
                  adsEnabled() ? '' : ', no tracking'
                }`}
              </span>
              <span>Made for people who read the privacy policy.</span>
            </div>
          </div>
        </footer>

        <ConsentBanner />
      </div>
    </div>
  )
}
