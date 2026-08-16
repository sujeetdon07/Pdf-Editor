import { PDFDocument } from 'pdf-lib'
import { canvasToBlob, loadPdf, renderPageToCanvas } from './pdfjs'

export type CompressionLevel = 'low' | 'recommended' | 'extreme'
export type CompressMode = 'level' | 'target'

interface CompressionSettings {
  dpi: number
  quality: number
}

const SETTINGS: Record<CompressionLevel, CompressionSettings> = {
  low: { dpi: 150, quality: 0.85 },
  recommended: { dpi: 110, quality: 0.6 },
  extreme: { dpi: 72, quality: 0.4 },
}

/** Rasterisation passes tried, in order, when aiming at a target file size. */
const TARGET_ATTEMPTS: CompressionSettings[] = [
  { dpi: 150, quality: 0.8 },
  { dpi: 120, quality: 0.65 },
  { dpi: 110, quality: 0.5 },
  { dpi: 96, quality: 0.4 },
  { dpi: 80, quality: 0.32 },
  { dpi: 72, quality: 0.25 },
  { dpi: 60, quality: 0.18 },
  { dpi: 50, quality: 0.12 },
]

export interface CompressOptions {
  mode: CompressMode
  level: CompressionLevel
  /** Rasterisation DPI used in 'level' mode; falls back to the level preset. */
  dpi?: number
  /** Desired output size in bytes, used in 'target' mode. */
  targetBytes?: number
}

export interface CompressResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  /** True when re-encoding grew the file and the original was kept instead. */
  keptOriginal: boolean
  /** Settings that produced the returned file. */
  dpi: number
  quality: number
  /** False when a target size was requested but could not be reached. */
  reachedTarget: boolean
}

const BASE_DPI = 72

async function rasterize(
  file: File,
  { dpi, quality }: CompressionSettings,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const bytes = await file.arrayBuffer()
  const source = await loadPdf(bytes)
  const output = await PDFDocument.create()

  for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber += 1) {
    const canvas = await renderPageToCanvas(source, pageNumber, dpi / BASE_DPI)
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
  return new Blob([saved as BlobPart], { type: 'application/pdf' })
}

export async function compressPdf(
  file: File,
  options: CompressOptions,
  onProgress?: (ratio: number) => void,
): Promise<CompressResult> {
  const original = await file.arrayBuffer()

  const finish = (blob: Blob, settings: CompressionSettings, reachedTarget: boolean) => {
    if (blob.size >= file.size) {
      return {
        blob: new Blob([original], { type: 'application/pdf' }),
        originalSize: file.size,
        compressedSize: file.size,
        keptOriginal: true,
        dpi: settings.dpi,
        quality: settings.quality,
        reachedTarget,
      }
    }
    return {
      blob,
      originalSize: file.size,
      compressedSize: blob.size,
      keptOriginal: false,
      dpi: settings.dpi,
      quality: settings.quality,
      reachedTarget,
    }
  }

  if (options.mode === 'level') {
    const preset = SETTINGS[options.level]
    const settings = { dpi: options.dpi ?? preset.dpi, quality: preset.quality }
    return finish(await rasterize(file, settings, onProgress), settings, true)
  }

  const target = options.targetBytes ?? file.size
  let best: { blob: Blob; settings: CompressionSettings } | null = null
  let lastTooBig: CompressionSettings | null = null

  for (let attempt = 0; attempt < TARGET_ATTEMPTS.length; attempt += 1) {
    const settings = TARGET_ATTEMPTS[attempt]
    const blob = await rasterize(file, settings, (ratio) =>
      onProgress?.((attempt + ratio) / TARGET_ATTEMPTS.length),
    )
    if (!best || blob.size < best.blob.size) best = { blob, settings }

    if (blob.size > target) {
      lastTooBig = settings
      continue
    }

    // The ladder overshoots; try once halfway back for a better-looking result.
    if (lastTooBig) {
      const refined = {
        dpi: Math.round((lastTooBig.dpi + settings.dpi) / 2),
        quality: (lastTooBig.quality + settings.quality) / 2,
      }
      const refinedBlob = await rasterize(file, refined)
      if (refinedBlob.size <= target) {
        onProgress?.(1)
        return finish(refinedBlob, refined, true)
      }
    }

    onProgress?.(1)
    return finish(blob, settings, true)
  }

  onProgress?.(1)
  if (!best) throw new Error('Could not compress this PDF.')
  return finish(best.blob, best.settings, false)
}
