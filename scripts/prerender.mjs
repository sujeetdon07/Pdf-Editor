/**
 * Post-build step: writes a real HTML file for every route so crawlers and
 * social scrapers get the right title, description, canonical URL, structured
 * data and readable copy without executing JavaScript. Vercel serves these
 * static files directly and React replaces the fallback markup as soon as it
 * mounts; addresses with no file fall through to 404.html.
 *
 * Also emits 404.html, sitemap.xml, robots.txt and — when an AdSense publisher
 * ID is configured — ads.txt, from the same route list.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { HOME, PAGES, SITE, TOOLS } from '../src/content/site.js'
import { homeSchema, pageSchema, toolSchema } from '../src/lib/schema.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

// Both are optional: unset simply means the tag or file is not written.
const ADSENSE_CLIENT = process.env.VITE_ADSENSE_CLIENT ?? ''
const SITE_VERIFICATION = process.env.VITE_GOOGLE_SITE_VERIFICATION ?? ''

const escape = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const paragraph = (text) => `<p>${escape(text)}</p>`

function fallbackBody(route) {
  const tool = TOOLS.find((candidate) => candidate.path === route.path)
  if (tool) {
    return [
      `<h1>${escape(tool.heading)}</h1>`,
      paragraph(tool.description),
      paragraph(tool.intro),
      `<h2>How to ${escape(tool.howTo)}</h2>`,
      `<ol>${tool.steps.map((step) => `<li>${escape(step)}</li>`).join('')}</ol>`,
      `<h2>Questions about this tool</h2>`,
      tool.faqs.map((faq) => `<h3>${escape(faq.q)}</h3>${paragraph(faq.a)}`).join(''),
    ].join('')
  }

  const page = PAGES.find((candidate) => candidate.path === route.path)
  if (page) {
    return [
      `<h1>${escape(page.heading)}</h1>`,
      paragraph(page.description),
      (page.sections ?? [])
        .map(
          (section) =>
            `<h2>${escape(section.heading)}</h2>${section.body.map(paragraph).join('')}`,
        )
        .join(''),
      (page.faqs ?? []).map((faq) => `<h3>${escape(faq.q)}</h3>${paragraph(faq.a)}`).join(''),
    ].join('')
  }

  return [
    `<h1>${escape(SITE.name)} — free online PDF tools that never upload your files</h1>`,
    paragraph(SITE.description),
    `<h2>All tools</h2>`,
    `<ul>${TOOLS.map(
      (tool) => `<li><a href="${tool.path}">${escape(tool.heading)}</a> — ${escape(tool.card)}</li>`,
    ).join('')}</ul>`,
    `<ul>${PAGES.map((page) => `<li><a href="${page.path}">${escape(page.label)}</a></li>`).join(
      '',
    )}</ul>`,
  ].join('')
}

function schemaFor(route) {
  const tool = TOOLS.find((candidate) => candidate.path === route.path)
  if (tool) return toolSchema(tool)
  const page = PAGES.find((candidate) => candidate.path === route.path)
  if (page) return pageSchema(page)
  return homeSchema(TOOLS)
}

/** Ownership and publisher tags Google looks for on every page. */
function verification() {
  const tags = []
  if (SITE_VERIFICATION) {
    tags.push(`<meta name="google-site-verification" content="${escape(SITE_VERIFICATION)}" />`)
  }
  if (ADSENSE_CLIENT) {
    tags.push(`<meta name="google-adsense-account" content="${escape(ADSENSE_CLIENT)}" />`)
  }
  return tags
}

function head(route) {
  const url = `${SITE.url}${route.path === '/' ? '/' : route.path}`
  const image = `${SITE.url}/logo.svg`
  if (route.noindex) {
    return [
      `<title>${escape(route.title)}</title>`,
      `<meta name="description" content="${escape(route.description)}" />`,
      `<meta name="robots" content="noindex, follow" />`,
      ...verification(),
    ].join('\n    ')
  }
  return [
    `<title>${escape(route.title)}</title>`,
    `<meta name="description" content="${escape(route.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escape(SITE.name)}" />`,
    `<meta property="og:title" content="${escape(route.title)}" />`,
    `<meta property="og:description" content="${escape(route.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(route.title)}" />`,
    `<meta name="twitter:description" content="${escape(route.description)}" />`,
    `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    ...verification(),
    `<script type="application/ld+json">${JSON.stringify(schemaFor(route)).replaceAll(
      '<',
      '\\u003c',
    )}</script>`,
  ].join('\n    ')
}

const template = await readFile(join(dist, 'index.html'), 'utf8')
const routes = [HOME, ...TOOLS, ...PAGES]

for (const route of routes) {
  const html = template
    .replace(/<title>.*?<\/title>\s*/s, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/s, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/s, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/s, '')
    .replace('</head>', `  ${head(route)}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallbackBody(route)}</div>`)

  const target = route.path === '/' ? join(dist, 'index.html') : join(dist, route.path, 'index.html')
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html)
}

// Vercel serves this with a 404 status for any address that has no file, and
// React Router swaps in the interactive NotFound page once it mounts.
const notFound = { path: '/404', noindex: true, title: `Page not found — ${SITE.name}`, description: 'That address does not exist on CelloPDF.' }
await writeFile(
  join(dist, '404.html'),
  template
    .replace(/<title>.*?<\/title>\s*/s, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/s, '')
    .replace(/<meta\s+name="robots"[^>]*>\s*/s, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/s, '')
    .replace('</head>', `  ${head(notFound)}\n  </head>`)
    .replace(
      '<div id="root"></div>',
      `<div id="root"><h1>Page not found</h1>${paragraph(
        'That address does not exist. Pick a tool below, or go back home.',
      )}<ul>${TOOLS.map(
        (tool) => `<li><a href="${tool.path}">${escape(tool.heading)}</a></li>`,
      ).join('')}</ul></div>`,
    ),
)

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE.url}${route.path === '/' ? '/' : route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route.path === '/' ? '1.0' : TOOLS.some((tool) => tool.path === route.path) ? '0.8' : '0.5'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
await writeFile(join(dist, 'sitemap.xml'), sitemap)

await writeFile(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`,
)

// Sellers declaration for AdSense; without it Google treats inventory as unauthorised.
if (ADSENSE_CLIENT.startsWith('ca-pub-')) {
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, '')
  await writeFile(join(dist, 'ads.txt'), `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`)
}

console.log(
  `prerendered ${routes.length} routes, 404.html, sitemap and robots.txt${
    ADSENSE_CLIENT ? ', ads.txt' : ''
  }`,
)
