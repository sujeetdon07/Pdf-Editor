import JSZip from 'jszip'
import { canvasToBlob, loadPdf, renderPageToCanvas } from './pdfjs'
import { stripExtension } from './files'

export type ImageFormat = 'png' | 'jpeg'
export type ImageQuality = 'normal' | 'high'

export interface RenderedPage {
  pageNumber: number
  blob: Blob
  url: string
  filename: string
  width: number
  height: number
}

const SCALES: Record<ImageQuality, number> = { normal: 1.5, high: 2.5 }

export async function pdfToImages(
  file: File,
  format: ImageFormat,
  quality: ImageQuality,
  onProgress?: (ratio: number) => void,
): Promise<RenderedPage[]> {
  const bytes = await file.arrayBuffer()
  const pdf = await loadPdf(bytes)
  const baseName = stripExtension(file.name)
  const pages: RenderedPage[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const canvas = await renderPageToCanvas(pdf, pageNumber, SCALES[quality])
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

export async function zipPages(pages: RenderedPage[]): Promise<Blob> {
  const zip = new JSZip()
  for (const page of pages) {
    zip.file(page.filename, page.blob)
  }
  return zip.generateAsync({ type: 'blob' })
}
