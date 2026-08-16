import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS } from '../content/site'

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — CelloPDF'
    const robots = document.createElement('meta')
    robots.name = 'robots'
    robots.content = 'noindex'
    document.head.append(robots)
    return () => robots.remove()
  }, [])

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900 sm:text-3xl">Page not found</h1>
      <p className="mt-2 text-sm text-ink-700">
        That address does not exist. Pick a tool below, or go back{' '}
        <Link to="/" className="text-rust-600 underline underline-offset-4">
          home
        </Link>
        .
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {TOOLS.map((tool) => (
          <li key={tool.path}>
            <Link
              to={tool.path}
              className="inline-block rounded-full border border-paper-400 px-3 py-1 text-xs text-ink-700 transition hover:border-rust-500/60 hover:text-ink-900"
            >
              {tool.heading}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
