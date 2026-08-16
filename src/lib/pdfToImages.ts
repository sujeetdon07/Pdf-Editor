import JSZip from 'jszip'
import { canvasToBlob, loadPdf, renderPageToCanvas } from './pdfjs'
import { stripExtension } from './files'

export type ImageFormat = 'png' | 'jpeg'

/** PDF user space is 72 units per inch, so scale = dpi / 72. */
export const BASE_DPI = 72
export const MIN_DPI = 36
export const MAX_DPI = 600

export interface RenderedPage {
  pageNumber: number
  blob: Blob
  url: string
  filename: string
  width: number
  height: number
}

export function clampDpi(dpi: number): number {
  if (!Number.isFinite(dpi)) return 150
  return Math.min(MAX_DPI, Math.max(MIN_DPI, Math.round(dpi)))
}

export async function pdfToImages(
  file: File,
  format: ImageFormat,
  dpi: number,
  onProgress?: (ratio: number) => void,
): Promise<RenderedPage[]> {
  const bytes = await file.arrayBuffer()
  const pdf = await loadPdf(bytes)
  const baseName = stripExtension(file.name)
  const pages: RenderedPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const canvas = await renderPageToCanvas(pdf, pageNumber, clampDpi(dpi) / BASE_DPI)
    const blob = await canvasToBlob(
      canvas,
      format === 'png' ? 'image/png' : 'image/jpeg',
      format === 'jpeg' ? 0.9 : undefined,
    )
    pages.push({
      pageNumber,
      blob,
      url: URL.createObjectURL(blob),
      filename: `${baseName}-page-${String(pageNumber).padStart(3, '0')}.${format === 'png' ? 'png' : 'jpg'}`,
      width: canvas.width,
      height: canvas.height,
    })
    canvas.width = 0
    canvas.height = 0
    onProgress?.(pageNumber / pdf.numPages)
  }

  await pdf.destroy()
  return pages
}

export async function renderThumbnails(file: File, maxPages = 60): Promise<string[]> {
  const pdf = await loadPdf(await file.arrayBuffer())
  const thumbnails: string[] = []
  const count = Math.min(pdf.numPages, maxPages)

  for (let pageNumber = 1; pageNumber <= count; pageNumber += 1) {
    const canvas = await renderPageToCanvas(pdf, pageNumber, 0.35)
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.7)
    thumbnails.push(URL.createObjectURL(blob))
    canvas.width = 0
    canvas.height = 0
  }

  await pdf.destroy()
  return thumbnails
}

export async function zipPages(pages: RenderedPage[]): Promise<Blob> {
  const zip = new JSZip()
  for (const page of pages) {
    zip.file(page.filename, page.blob)
  }
  return zip.generateAsync({ type: 'blob' })
}
