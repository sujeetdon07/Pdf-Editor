import { PDFDocument } from 'pdf-lib'
import { canvasToBlob } from './pdfjs'

export type MarkKind = 'text' | 'highlight' | 'whiteout'

/** Positions and sizes are fractions of the page, so they survive any zoom. */
export interface Mark {
  id: string
  page: number
  kind: MarkKind
  x: number
  y: number
  width: number
  height: number
  text: string
  size: number
  color: string
}

/** Extra resolution for the overlay, so stamped text stays crisp when zoomed. */
const OVERLAY_SCALE = 3

function drawMark(
  context: CanvasRenderingContext2D,
  mark: Mark,
  pageWidth: number,
  pageHeight: number,
) {
  const x = mark.x * pageWidth
  const y = mark.y * pageHeight

  if (mark.kind === 'text') {
    context.fillStyle = mark.color
    context.textBaseline = 'top'
    context.font = `${mark.size}px "Noto Sans", "Noto Sans CJK SC", "Noto Sans Devanagari", "Noto Sans Arabic", Inter, system-ui, sans-serif`
    for (const [index, line] of mark.text.split('\n').entries()) {
      context.fillText(line, x, y + index * mark.size * 1.3)
    }
    return
  }

  const width = mark.width * pageWidth
  const height = mark.height * pageHeight
  context.fillStyle = mark.kind === 'whiteout' ? '#ffffff' : mark.color
  context.globalAlpha = mark.kind === 'whiteout' ? 1 : 0.35
  context.fillRect(x, y, width, height)
  context.globalAlpha = 1
}

/**
 * Burn marks into a PDF as a transparent image layer per page. Drawing through
 * a canvas means any script the browser can render can be stamped, without
 * embedding a font for it.
 */
export async function stampPdf(
  file: File,
  marks: Mark[],
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  if (marks.length === 0) throw new Error('Add at least one edit first.')

  const pdf = await PDFDocument.load(await file.arrayBuffer())
  const pages = pdf.getPages()
  const edited = [...new Set(marks.map((mark) => mark.page))].sort((a, b) => a - b)

  for (const [index, pageNumber] of edited.entries()) {
    const page = pages[pageNumber - 1]
    if (!page) continue
    const { width, height } = page.getSize()

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(width * OVERLAY_SCALE)
    canvas.height = Math.round(height * OVERLAY_SCALE)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Could not create a 2D canvas context')
    context.scale(OVERLAY_SCALE, OVERLAY_SCALE)

    for (const mark of marks.filter((candidate) => candidate.page === pageNumber)) {
      drawMark(context, mark, width, height)
    }

    const blob = await canvasToBlob(canvas, 'image/png')
    const image = await pdf.embedPng(await blob.arrayBuffer())
    page.drawImage(image, { x: 0, y: 0, width, height })

    canvas.width = 0
    canvas.height = 0
    onProgress?.((index + 1) / edited.length)
  }

  const saved = await pdf.save()
  return new Blob([saved as BlobPart], { type: 'application/pdf' })
}
