export interface Faq {
  q: string
  a: string
}

export interface Section {
  heading: string
  body: string[]
}

export interface RouteMeta {
  path: string
  title: string
  description: string
}

export interface ToolPage extends RouteMeta {
  label: string
  group: 'Workbench' | 'Convert'
  glyph: string
  heading: string
  /** Verb phrase for the "How to …" heading, e.g. "convert a PDF to Excel". */
  howTo: string
  card: string
  tag: string
  intro: string
  steps: string[]
  faqs: Faq[]
}

export interface ContentPage extends RouteMeta {
  label: string
  heading: string
  sections?: Section[]
  faqs?: Faq[]
}

export const SITE: {
  name: string
  url: string
  tagline: string
  description: string
  email: string
}
export const TOOLS: ToolPage[]
export const PAGES: ContentPage[]
export const NAV_GROUPS: { label: string; items: ToolPage[] }[]
export const HOME: RouteMeta
export const ROUTES: RouteMeta[]
