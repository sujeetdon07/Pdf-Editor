import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { canvasToBlob } from './pdfjs'

export type DocPageSize = 'a4' | 'letter'
export type DocOrientation = 'portrait' | 'landscape'

/** CSS pixels are 96 per inch, PDF points are 72 per inch. */
const PX_TO_PT = 72 / 96
const RENDER_SCALE = 2

const PAGE_PIXELS: Record<DocPageSize, [number, number]> = {
  a4: [794, 1123],
  letter: [816, 1056],
}

export interface HtmlToPdfOptions {
  pageSize: DocPageSize
  orientation: DocOrientation
  /** Page margin in CSS pixels. */
  margin: number
}

/**
 * Text is laid out by the browser, so every script the browser can render
 * (CJK, Indic, Arabic, Cyrillic, …) comes out correct without embedding fonts.
 */
export const DOCUMENT_STYLES = `
  color: #111827;
  font-family: "Noto Sans", "Noto Sans CJK SC", "Noto Sans Devanagari", "Noto Sans Arabic", Inter, system-ui, sans-serif;
  font-size: 14px;
  line-height: 1.55;
  background: #ffffff;
`

function createHost(widthPx: number): HTMLDivElement {
  const host = document.createElement('div')
  host.setAttribute('style', DOCUMENT_STYLES)
  host.style.position = 'fixed'
  host.style.top = '0'
  host.style.left = '-20000px'
  host.style.width = `${widthPx}px`
  host.style.padding = '0'
  // Contain child margins so DOM offsets match the rendered canvas.
  host.style.display = 'flow-root'
  document.body.appendChild(host)
  return host
}

/** How far above a page boundary a blank row is still an acceptable break. */
const SEARCH_RATIO = 0.3
/** Ink tolerated on a break row, so table borders do not block pagination. */
const INK_RATIO = 0.03

/**
 * Last blank pixel row at or above `limit`, so pages never cut through a line
 * of text. Works on the rendered canvas, which is the only faithful record of
 * where the browser actually painted each line.
 */
function blankRowBefore(
  context: CanvasRenderingContext2D,
  width: number,
  from: number,
  limit: number,
): number | null {
  const top = Math.max(from + 1, Math.floor(limit - (limit - from) * SEARCH_RATIO))
  const height = limit - top
  if (height <= 0) return null

  const { data } = context.getImageData(0, top, width, height)

  const budget = Math.max(2, Math.floor(width * INK_RATIO))

  for (let row = height - 1; row >= 0; row -= 1) {
    let ink = 0
    for (let column = 0; column < width; column += 1) {
      const offset = (row * width + column) * 4
      if (data[offset] < 250 || data[offset + 1] < 250 || data[offset + 2] < 250) {
        ink += 1
        if (ink > budget) break
      }
    }
    if (ink <= budget) return top + row
  }

  return null
}

/** Break offsets, in canvas pixels, that avoid slicing through content. */
function breakOffsets(source: HTMLCanvasElement, pageRows: number): number[] {
  const context = source.getContext('2d', { willReadFrequently: true })
  const breaks: number[] = [0]
  let start = 0

  while (start + pageRows < source.height) {
    const limit = start + pageRows
    const blank = context ? blankRowBefore(context, source.width, start, limit) : null
    // A single block taller than one page has to be sliced.
    breaks.push(blank ?? limit)
    start = breaks[breaks.length - 1]
  }

  breaks.push(source.height)
  return breaks
}

/**
 * One PDF page per HTML block, each rendered at a fixed size. Used for content
 * that is already paginated, such as slides.
 */
export async function fixedPagesToPdf(
  pages: string[],
  widthPx: number,
  heightPx: number,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const pdf = await PDFDocument.create()

  for (const [index, html] of pages.entries()) {
    const host = createHost(widthPx)
    host.style.height = `${heightPx}px`
    host.style.overflow = 'hidden'
    host.innerHTML = html

    try {
      const canvas = await html2canvas(host, {
        scale: RENDER_SCALE,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: widthPx,
      })
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
      const image = await pdf.embedJpg(await blob.arrayBuffer())
      const page = pdf.addPage([widthPx * PX_TO_PT, heightPx * PX_TO_PT])
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: widthPx * PX_TO_PT,
        height: heightPx * PX_TO_PT,
      })
      canvas.width = 0
      canvas.height = 0
    } finally {
      host.remove()
    }

    onProgress?.((index + 1) / pages.length)
  }

  const saved = await pdf.save()
  return new Blob([saved as BlobPart], { type: 'application/pdf' })
}

export async function htmlToPdf(
  html: string,
  options: HtmlToPdfOptions,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const [shortSide, longSide] = PAGE_PIXELS[options.pageSize]
  const [pageWidth, pageHeight] =
    options.orientation === 'portrait' ? [shortSide, longSide] : [longSide, shortSide]
  const contentWidth = pageWidth - options.margin * 2
  const contentHeight = pageHeight - options.margin * 2

  const host = createHost(contentWidth)
  host.innerHTML = html

  try {
    if (host.scrollHeight === 0) throw new Error('There was no content to convert.')

    const source = await html2canvas(host, {
      scale: RENDER_SCALE,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: contentWidth,
    })

    const scale = source.height / host.scrollHeight
    const breaks = breakOffsets(source, Math.floor(contentHeight * scale))
    const pdf = await PDFDocument.create()
    const pageCount = breaks.length - 1

    for (let index = 0; index < pageCount; index += 1) {
      const startRow = breaks[index]
      const rows = Math.min(breaks[index + 1] - startRow, Math.floor(contentHeight * scale))
      if (rows <= 0) continue
      const slicePx = rows / scale

      const slice = document.createElement('canvas')
      slice.width = source.width
      slice.height = rows
      const context = slice.getContext('2d')
      if (!context) throw new Error('Could not create a 2D canvas context')
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, slice.width, slice.height)
      context.drawImage(
        source,
        0,
        startRow,
        slice.width,
        slice.height,
        0,
        0,
        slice.width,
        slice.height,
      )

      const blob = await canvasToBlob(slice, 'image/jpeg', 0.92)
      const image = await pdf.embedJpg(await blob.arrayBuffer())
      const page = pdf.addPage([pageWidth * PX_TO_PT, pageHeight * PX_TO_PT])
      page.drawImage(image, {
        x: options.margin * PX_TO_PT,
        y: (pageHeight - options.margin - slicePx) * PX_TO_PT,
        width: contentWidth * PX_TO_PT,
        height: slicePx * PX_TO_PT,
      })

      slice.width = 0
      slice.height = 0
      onProgress?.((index + 1) / pageCount)
    }

    const saved = await pdf.save()
    return new Blob([saved as BlobPart], { type: 'application/pdf' })
  } finally {
    host.remove()
  }
}
