import { Document, Packer, PageBreak, Paragraph, TextRun } from 'docx'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { loadPdf } from './pdfjs'

interface Line {
  text: string
  size: number
}

/** Group PDF text items into visual lines using their baseline position. */
function toLines(items: TextItem[], tolerance = 2): Line[] {
  const lines: { y: number; size: number; parts: string[] }[] = []

  for (const item of items) {
    if (!item.str) continue
    const y = item.transform[5]
    const size = item.height || Math.abs(item.transform[3]) || 12
    const line = lines.find((candidate) => Math.abs(candidate.y - y) <= tolerance)
    if (line) {
      line.parts.push(item.str)
      line.size = Math.max(line.size, size)
    } else {
      lines.push({ y, size, parts: [item.str] })
    }
  }

  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => ({ text: line.parts.join('').replace(/\s+/g, ' ').trim(), size: line.size }))
    .filter((line) => line.text.length > 0)
}

export interface PdfToDocxResult {
  blob: Blob
  pageCount: number
  characters: number
}

export async function pdfToDocx(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<PdfToDocxResult> {
  const pdf = await loadPdf(await file.arrayBuffer())
  const paragraphs: Paragraph[] = []
  let characters = 0

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const items = content.items.filter((item): item is TextItem => 'str' in item)
      const lines = toLines(items)
      const bodySize =
        lines.length > 0
          ? [...lines].sort((a, b) => a.size - b.size)[Math.floor(lines.length / 2)].size
          : 12

      for (const line of lines) {
        characters += line.text.length
        const heading = line.size > bodySize * 1.25
        paragraphs.push(
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: line.text,
                bold: heading,
                // docx sizes are half-points.
                size: Math.round(line.size * 2),
              }),
            ],
          }),
        )
      }

      page.cleanup()
      if (pageNumber < pdf.numPages) {
        paragraphs.push(new Paragraph({ children: [new PageBreak()] }))
      }
      onProgress?.(pageNumber / pdf.numPages)
    }

    if (characters === 0) {
      throw new Error(
        'No selectable text was found — this PDF is probably a scan, which needs OCR.',
      )
    }

    const document = new Document({ sections: [{ children: paragraphs }] })
    const blob = await Packer.toBlob(document)
    return { blob, pageCount: pdf.numPages, characters }
  } finally {
    await pdf.destroy()
  }
}
