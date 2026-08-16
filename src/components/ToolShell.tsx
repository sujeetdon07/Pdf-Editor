import type { ReactNode } from 'react'

interface ToolShellProps {
  title: string
  description: string
  children: ReactNode
  sidebar?: ReactNode
}

export default function ToolShell({ title, description, children, sidebar }: ToolShellProps) {
  return (
    <div>
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
