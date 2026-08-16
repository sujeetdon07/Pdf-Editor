import { useLocation } from 'react-router-dom'
import { PAGES } from '../content/site'
import { pageSchema } from '../lib/schema'
import FaqList from '../components/FaqList'
import Seo from '../components/Seo'

/** Renders About, Privacy, FAQ, Contact and Terms from the shared content file. */
export default function ContentPage() {
  const { pathname } = useLocation()
  const page = PAGES.find((candidate) => candidate.path === pathname)
  if (!page) return null

  return (
    <article className="max-w-3xl">
      <Seo
        title={page.title}
        description={page.description}
        path={page.path}
        schema={pageSchema(page)}
      />

      <div className="mb-8 border-l-2 border-rust-500 pl-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          {page.heading}
        </h1>
        <p className="mt-1 text-sm text-ink-700">{page.description}</p>
      </div>

      {page.sections?.map((section) => (
        <section key={section.heading} className="mb-8">
          <h2 className="font-display text-lg font-bold text-ink-900">{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-sm leading-relaxed text-ink-700">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      {page.faqs ? <FaqList heading="Common questions" faqs={page.faqs} /> : null}
    </article>
  )
}
