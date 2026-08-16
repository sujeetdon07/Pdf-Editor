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
      <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">Page not found</h1>
      <p className="mt-2 text-sm text-ink-300">
        That address does not exist. Pick a tool below, or go back{' '}
        <Link to="/" className="text-iris-300 underline underline-offset-4">
          home
        </Link>
        .
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {TOOLS.map((tool) => (
          <li key={tool.path}>
            <Link
              to={tool.path}
              className="inline-block rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-300 transition hover:border-iris-500/60 hover:text-white"
            >
              {tool.heading}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
