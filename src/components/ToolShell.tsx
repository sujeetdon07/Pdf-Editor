import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../content/site'
import { toolSchema } from '../lib/schema'
import Seo from './Seo'
import FaqList from './FaqList'

interface ToolShellProps {
  title: string
  description: string
  children: ReactNode
  sidebar?: ReactNode
}

/**
 * Every tool page is described once in `content/site.js`; the shell looks its
 * own route up there so the head tags and the article below the tool stay in
 * sync with the sitemap and the prerendered HTML.
 */
export default function ToolShell({ title, description, children, sidebar }: ToolShellProps) {
  const { pathname } = useLocation()
  const tool = TOOLS.find((candidate) => candidate.path === pathname)
  const related = TOOLS.filter((candidate) => candidate.path !== pathname).slice(0, 6)

  return (
    <div>
      {tool ? (
        <Seo
          title={tool.title}
          description={tool.description}
          path={tool.path}
          schema={toolSchema(tool)}
        />
      ) : null}

      <div className="mb-8 border-l-2 border-iris-500 pl-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-300">{description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>{children}</div>
        {sidebar ? <aside className="panel h-fit p-5">{sidebar}</aside> : null}
      </div>

      {tool ? (
        <article className="mt-14 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-white">
            {tool.heading} — how it works
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-300">{tool.intro}</p>

          <h3 className="mt-8 font-display text-lg font-bold text-white">How to {tool.howTo}</h3>
          <ol className="mt-3 space-y-2 text-sm text-ink-300">
            {tool.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-iris-500/15 text-xs font-semibold text-iris-300">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <FaqList heading="Questions about this tool" faqs={tool.faqs} />

          <h3 className="mt-10 font-display text-lg font-bold text-white">Related tools</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="inline-block rounded-full border border-ink-700 px-3 py-1 text-xs text-ink-300 transition hover:border-iris-500/60 hover:text-white"
                >
                  {item.heading}
                </Link>
              </li>
            ))}
          </ul>
        </article>
      ) : null}
    </div>
  )
}

interface OptionGroupProps<T extends string> {
  legend: string
  value: T
  options: { value: T; label: string; description?: string }[]
  onChange: (value: T) => void
}

export function OptionGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: OptionGroupProps<T>) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-ink-500">
        {legend}
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition ${
              value === option.value
                ? 'border-iris-500 bg-iris-500/10'
                : 'border-ink-800 hover:border-ink-700'
            }`}
          >
            <input
              type="radio"
              className="mt-1 accent-iris-500"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <span className="block font-medium text-white">{option.label}</span>
              {option.description ? (
                <span className="block text-ink-300">{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function ProgressBar({ ratio, label }: { ratio: number; label?: string }) {
  return (
    <div>
      {label ? <p className="mb-2 text-xs text-ink-300">{label}</p> : null}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-iris-500 to-mint-400 transition-all"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  )
}
