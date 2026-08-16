import type { Faq } from '../content/site'

export default function FaqList({ heading, faqs }: { heading: string; faqs: Faq[] }) {
  return (
    <section className="mt-10">
      <h3 className="font-display text-lg font-bold text-ink-900">{heading}</h3>
      <dl className="mt-3 divide-y divide-paper-300 border-y border-paper-300">
        {faqs.map((faq) => (
          <div key={faq.q} className="py-4">
            <dt className="text-sm font-semibold text-ink-900">{faq.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-700">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
