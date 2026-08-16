import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { TOOLS } from '../content/site'
import { AD_SLOTS } from '../lib/ads'
import { toolSchema } from '../lib/schema'
import Seo from './Seo'
import AdSlot from './AdSlot'
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

      <div className="mb-8 border-l-2 border-rust-500 pl-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-700">{description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>{children}</div>
        {sidebar ? <aside className="panel h-fit p-5">{sidebar}</aside> : null}
      </div>

      <AdSlot slot={AD_SLOTS.article} className="mt-10 max-w-3xl" />

      {tool ? (
        <article className="mt-14 max-w-3xl">
          <h2 className="font-display text-xl font-bold text-ink-900">
            {tool.heading} — how it works
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-700">{tool.intro}</p>

          <h3 className="mt-8 font-display text-lg font-bold text-ink-900">How to {tool.howTo}</h3>
          <ol className="mt-3 space-y-2 text-sm text-ink-700">
            {tool.steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rust-500/15 text-xs font-semibold text-rust-600">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          <FaqList heading="Questions about this tool" faqs={tool.faqs} />

          <h3 className="mt-10 font-display text-lg font-bold text-ink-900">Related tools</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="inline-block rounded-full border border-paper-400 px-3 py-1 text-xs text-ink-700 transition hover:border-rust-500/60 hover:text-ink-900"
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
                ? 'border-rust-500 bg-rust-500/10'
                : 'border-paper-300 hover:border-paper-400'
            }`}
          >
            <input
              type="radio"
              className="mt-1 accent-rust-500"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <span className="block font-medium text-ink-900">{option.label}</span>
              {option.description ? (
                <span className="block text-ink-700">{option.description}</span>
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
      {label ? <p className="mb-2 text-xs text-ink-700">{label}</p> : null}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-paper-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rust-500 to-moss-400 transition-all"
          style={{ width: `${Math.round(ratio * 100)}%` }}
        />
      </div>
    </div>
  )
}
