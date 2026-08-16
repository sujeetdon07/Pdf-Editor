import { PDFDocument } from 'pdf-lib'
import { canvasToBlob, loadPdf, renderPageToCanvas } from './pdfjs'

export type CompressionLevel = 'low' | 'recommended' | 'extreme'

interface CompressionSettings {
  scale: number
  quality: number
}

const SETTINGS: Record<CompressionLevel, CompressionSettings> = {
  low: { scale: 1.5, quality: 0.85 },
  recommended: { scale: 1.1, quality: 0.6 },
  extreme: { scale: 0.8, quality: 0.4 },
}

export interface CompressResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  /** True when re-encoding grew the file and the original was kept instead. */
  keptOriginal: boolean
}

export async function compressPdf(
  file: File,
  level: CompressionLevel,
  onProgress?: (ratio: number) => void,
): Promise<CompressResult> {
  const { scale, quality } = SETTINGS[level]
  const bytes = await file.arrayBuffer()
  const source = await loadPdf(bytes.slice(0))
  const output = await PDFDocument.create()

  for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
    const canvas = await renderPageToCanvas(source, pageNumber, scale)
    const jpeg = await canvasToBlob(canvas, 'image/jpeg', quality)
    const image = await output.embedJpg(await jpeg.arrayBuffer())
    const sourcePage = await source.getPage(pageNumber)
    const [, , width, height] = sourcePage.view
    const rotation = sourcePage.rotate % 180 === 0 ? 0 : 90
    const pageWidth = rotation === 0 ? width : height
    const pageHeight = rotation === 0 ? height : width
    const page = output.addPage([pageWidth, pageHeight])
    page.drawImage(image, { x: 0, y: 0, width: pageWidth, height: pageHeight })
    canvas.width = 0
    canvas.height = 0
    onProgress?.(pageNumber / source.numPages)
  }

  const saved = await output.save()
  await source.destroy()

  const compressed = new Blob([saved as BlobPart], { type: 'application/pdf' })
  if (compressed.size >= file.size) {
    return {
      blob: new Blob([bytes], { type: 'application/pdf' }),
      originalSize: file.size,
      compressedSize: file.size,
      keptOriginal: true,
    }
  }

  return {
    blob: compressed,
    originalSize: file.size,
    compressedSize: compressed.size,
    keptOriginal: false,
  }
}
