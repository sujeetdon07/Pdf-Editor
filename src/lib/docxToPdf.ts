import mammoth from 'mammoth'
import { htmlToPdf, type HtmlToPdfOptions } from './htmlToPdf'

const DOCUMENT_CSS = `
  <style>
    h1, h2, h3, h4 { margin: 1.1em 0 0.5em; line-height: 1.3; }
    h1 { font-size: 1.9em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.2em; }
    p { margin: 0 0 0.85em; }
    ul, ol { margin: 0 0 0.85em 1.4em; padding: 0; }
    li { margin: 0 0 0.3em; }
    table { border-collapse: collapse; width: 100%; margin: 0 0 1em; }
    td, th { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; vertical-align: top; }
    img { max-width: 100%; }
    a { color: #1d4ed8; }
  </style>
`

export interface DocxConversion {
  blob: Blob
  warnings: string[]
}

export async function docxToPdf(
  file: File,
  options: HtmlToPdfOptions,
  onProgress?: (ratio: number) => void,
): Promise<DocxConversion> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const body = result.value.trim()
  if (!body) throw new Error('This document has no readable content.')

  const blob = await htmlToPdf(`${DOCUMENT_CSS}<div>${body}</div>`, options, onProgress)
  return { blob, warnings: result.messages.map((message) => message.message) }
}
