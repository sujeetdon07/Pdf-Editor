import { Link } from 'react-router-dom'
import { HOME, PAGES, SITE, TOOLS } from '../content/site'
import { homeSchema } from '../lib/schema'
import FaqList from '../components/FaqList'
import Seo from '../components/Seo'

const HIGHLIGHTS = [
  {
    heading: 'Nothing is uploaded',
    body: 'Files are opened, processed and saved by your own browser. There is no server to send them to, so confidential documents stay confidential.',
  },
  {
    heading: 'No limits, no account',
    body: 'No sign-up, no watermark, no daily quota and no file size cap beyond your device memory. Every tool is free.',
  },
  {
    heading: 'Every language',
    body: 'Documents are laid out with your browser’s text engine, so Hindi, Chinese, Japanese, Arabic, Russian and more render correctly.',
  },
]

const homeFaqs = PAGES.find((page) => page.path === '/faq')?.faqs?.slice(0, 5) ?? []

export default function Home() {
  return (
    <div>
      <Seo
        title={HOME.title}
        description={HOME.description}
        path="/"
        schema={homeSchema(TOOLS)}
      />

      <section className="panel overflow-hidden p-8 sm:p-12">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-mint-400/40 bg-mint-400/10 px-3 py-1 text-xs font-medium text-mint-400">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-400" />
          Runs entirely on your device
        </p>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
          Free online PDF tools that
          <br />
          never see your files.
        </h1>
        <p className="mt-4 max-w-xl text-ink-300">
          {TOOLS.length} precise tools built on modern browser APIs. Compress a PDF to an exact
          size, convert between PDF, Word, Excel, PowerPoint and images, edit pages — and keep every
          byte on your own machine.
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
          All {TOOLS.length} tools
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <Link
              key={tool.path}
              to={tool.path}
              className="group panel flex items-start justify-between gap-4 p-5 transition hover:border-iris-500/60 hover:bg-ink-850"
            >
              <div>
                <h3 className="font-display text-lg font-bold text-white">{tool.heading}</h3>
                <p className="mt-1 text-sm text-ink-300">{tool.card}</p>
              </div>
              <span className="shrink-0 rounded-full border border-ink-700 px-2.5 py-1 text-[11px] text-ink-300 group-hover:border-iris-500/60 group-hover:text-iris-300">
                {tool.tag}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {HIGHLIGHTS.map((item) => (
          <div key={item.heading} className="panel p-5">
            <h2 className="font-display text-base font-bold text-white">{item.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-300">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-xl font-bold text-white">
          A complete PDF toolkit that runs in the browser
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-300">
          {SITE.name} handles the everyday document jobs that usually mean uploading a private file
          to a stranger’s server: shrinking a PDF so it fits an application form’s upload limit,
          merging scanned pages into one file, turning a spreadsheet into a printable table or
          pulling a table back out of a report. Each one runs as ordinary JavaScript in the tab you
          already have open.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-ink-300">
          PDFs are read with PDF.js, the same engine Firefox uses to display them, and written with
          pdf-lib. Word, Excel and PowerPoint files are unpacked in the browser and laid out with
          the browser’s own typography, which is why documents in scripts that normally break online
          converters come out looking right. Pick a tool from the list above, or read more about{' '}
          <Link to="/about" className="text-iris-300 underline underline-offset-4">
            how it works
          </Link>
          .
        </p>
        <FaqList heading="Frequently asked questions" faqs={homeFaqs} />
        <p className="mt-4 text-sm text-ink-300">
          More answers on the{' '}
          <Link to="/faq" className="text-iris-300 underline underline-offset-4">
            FAQ page
          </Link>
          .
        </p>
      </section>
    </div>
  )
}
