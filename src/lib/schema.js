/**
 * schema.org builders shared by the running app and by the build-time
 * prerenderer, so both emit identical structured data. Plain JavaScript because
 * `scripts/prerender.mjs` imports it under Node; `schema.d.ts` holds the types.
 */
import { SITE } from '../content/site.js'

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }
}

export function breadcrumbSchema(name, path) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE.url },
      { '@type': 'ListItem', position: 2, name, item: `${SITE.url}${path}` },
    ],
  }
}

export function toolSchema(tool) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `${tool.heading} — ${SITE.name}`,
      url: `${SITE.url}${tool.path}`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any browser',
      browserRequirements: 'Requires JavaScript',
      description: tool.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to ${tool.howTo}`,
      description: tool.description,
      totalTime: 'PT1M',
      step: tool.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
    faqSchema(tool.faqs),
    breadcrumbSchema(tool.heading, tool.path),
  ]
}

export function pageSchema(page) {
  const schema = [breadcrumbSchema(page.heading, page.path)]
  if (page.faqs) schema.push(faqSchema(page.faqs))
  return schema
}

export function homeSchema(tools) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: `${SITE.name} tools`,
      itemListElement: tools.map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: tool.heading,
        url: `${SITE.url}${tool.path}`,
      })),
    },
  ]
}
