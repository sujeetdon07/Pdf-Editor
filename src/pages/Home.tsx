import { Link } from 'react-router-dom'

const TOOLS = [
  {
    to: '/compress-pdf',
    title: 'Compress',
    description: 'Hit an exact target size in KB or MB, or pick a quality preset.',
    tag: 'Target size',
  },
  {
    to: '/jpg-to-pdf',
    title: 'Image → PDF',
    description: 'Bundle JPG, PNG or WebP files into one document, in your order.',
    tag: 'A4 · Letter · Fit',
  },
  {
    to: '/pdf-to-jpg',
    title: 'PDF → Image',
    description: 'Export pages as JPG or PNG at any DPI from 72 up to 600.',
    tag: 'Custom DPI',
  },
  {
    to: '/merge-pdf',
    title: 'Merge',
    description: 'Chain several PDFs into a single file without re-encoding pages.',
    tag: 'Lossless',
  },
  {
    to: '/split-pdf',
    title: 'Split',
    description: 'Pull out page ranges, or explode a document one page per file.',
    tag: 'Ranges · ZIP',
  },
  {
    to: '/rotate-pdf',
    title: 'Rotate',
    description: 'Fix orientation page by page with live thumbnails.',
    tag: 'Per page',
  },
]

export default function Home() {
  return (
    <div>
      <section className="panel overflow-hidden p-8 sm:p-12">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint-400/40 bg-mint-400/10 px-3 py-1 text-xs font-medium text-mint-400">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
          Runs entirely on your device
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          A PDF workbench that
          <br />
          never sees your files.
        </h1>
        <p className="mt-4 max-w-xl text-ink-300">
          Six precise tools built on WebAssembly-era browser APIs. Set a target file size, choose an
          export DPI, and keep every byte on your own machine.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/compress-pdf" className="btn-primary">
            Compress a PDF
          </Link>
          <Link to="/pdf-to-jpg" className="btn-ghost px-5 py-3">
            Export pages at 300 DPI
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-ink-500">
          All tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="group panel flex items-start justify-between gap-4 p-5 transition hover:border-iris-500/60 hover:bg-ink-850"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-white">{tool.title}</h3>
                <p className="mt-1 text-sm text-ink-300">{tool.description}</p>
              </div>
              <span className="shrink-0 rounded-full border border-ink-700 px-2.5 py-1 text-[11px] text-ink-300 group-hover:border-iris-500/60 group-hover:text-iris-300">
                {tool.tag}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
