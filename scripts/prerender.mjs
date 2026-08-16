/**
 * Post-build step: writes a real HTML file for every route so crawlers and
 * social scrapers get the right title, description, canonical URL, structured
 * data and readable copy without executing JavaScript. Vercel serves these
 * static files before the SPA rewrite, and React replaces the fallback markup
 * as soon as it mounts.
 *
 * Also emits sitemap.xml and robots.txt from the same route list.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { HOME, PAGES, SITE, TOOLS } from '../src/content/site.js'
import { homeSchema, pageSchema, toolSchema } from '../src/lib/schema.js'

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

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

function head(route) {
  const url = `${SITE.url}${route.path === '/' ? '/' : route.path}`
  const image = `${SITE.url}/logo.svg`
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

console.log(`prerendered ${routes.length} routes, sitemap and robots.txt`)
