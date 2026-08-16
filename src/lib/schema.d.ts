import type { ContentPage, Faq, ToolPage } from '../content/site'

export function faqSchema(faqs: Faq[]): object
export function breadcrumbSchema(name: string, path: string): object
export function toolSchema(tool: ToolPage): object[]
export function pageSchema(page: ContentPage): object[]
export function homeSchema(tools: ToolPage[]): object[]
