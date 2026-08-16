import type { Faq } from '../content/site'

export default function FaqList({ heading, faqs }: { heading: string; faqs: Faq[] }) {
  return (
    <section className="mt-10">
      <h3 className="font-display text-lg font-bold text-white">{heading}</h3>
      <dl className="mt-3 divide-y divide-ink-800 border-y border-ink-800">
        {faqs.map((faq) => (
          <div key={faq.q} className="py-4">
            <dt className="text-sm font-semibold text-white">{faq.q}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-300">{faq.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
