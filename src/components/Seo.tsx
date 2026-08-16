import { useEffect } from 'react'
import { SITE } from '../content/site'

function setMeta(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.append(tag)
  }
  tag.content = content
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!tag) {
    tag = document.createElement('link')
    tag.rel = rel
    document.head.append(tag)
  }
  tag.href = href
}

export interface SeoProps {
  title: string
  description: string
  path: string
  /** schema.org structured data for this page. */
  schema?: object[]
}

/**
 * Keeps the head in sync while navigating the SPA. The same tags are baked into
 * each prerendered HTML file at build time, so crawlers see them without JS.
 */
export default function Seo({ title, description, path, schema }: SeoProps) {
  useEffect(() => {
    const url = `${SITE.url}${path === '/' ? '' : path}`
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setLink('canonical', url)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', url)
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE.name)
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description)
  }, [title, description, path])

  // Serialised so a re-render with an equivalent literal does not re-insert it.
  const json = schema && schema.length > 0 ? JSON.stringify(schema) : ''

  useEffect(() => {
    if (!json) return
    // Drop the copy baked in by the prerenderer so a page never has two.
    for (const stale of document.head.querySelectorAll('script[type="application/ld+json"]')) {
      stale.remove()
    }
    const tag = document.createElement('script')
    tag.type = 'application/ld+json'
    tag.dataset.page = 'true'
    tag.textContent = json
    document.head.append(tag)
    return () => tag.remove()
  }, [json])

  return null
}
