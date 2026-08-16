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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-slate-600">{description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>{children}</div>
        {sidebar ? (
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5">
            {sidebar}
          </aside>
        ) : null}
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
      <legend className="mb-2 text-sm font-semibold text-slate-900">{legend}</legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm transition ${
              value === option.value
                ? 'border-brand-500 bg-brand-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input
              type="radio"
              className="mt-1 accent-brand-500"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <span className="block font-medium text-slate-900">{option.label}</span>
              {option.description ? (
                <span className="block text-slate-500">{option.description}</span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function ProgressBar({ ratio }: { ratio: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${Math.round(ratio * 100)}%` }}
      />
    </div>
  )
}
