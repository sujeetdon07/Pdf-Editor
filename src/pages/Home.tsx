import { Link } from 'react-router-dom'

const TOOLS = [
  {
    to: '/compress-pdf',
    title: 'Compress PDF',
    description: 'Shrink PDF file size while keeping decent quality.',
    icon: '🗜️',
  },
  {
    to: '/jpg-to-pdf',
    title: 'Image to PDF',
    description: 'Turn JPG, PNG or WebP images into a single PDF document.',
    icon: '🖼️',
  },
  {
    to: '/pdf-to-jpg',
    title: 'PDF to Image',
    description: 'Export every page of a PDF as a JPG or PNG image.',
    icon: '📄',
  },
]

export default function Home() {
  return (
    <div>
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Every tool you need to work with PDFs
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Compress, convert and export your documents in seconds. All processing happens in your
          browser, so nothing is ever uploaded.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-lg"
          >
            <div className="text-3xl">{tool.icon}</div>
            <h2 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-brand-600">
              {tool.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600">{tool.description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
