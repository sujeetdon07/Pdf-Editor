import { PDFDocument, type PDFImage } from 'pdf-lib'
import { canvasToBlob } from './pdfjs'

export type PageSize = 'fit' | 'a4' | 'letter'
export type Orientation = 'portrait' | 'landscape'

const PAGE_DIMENSIONS: Record<Exclude<PageSize, 'fit'>, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
}

export interface ImagesToPdfOptions {
  pageSize: PageSize
  orientation: Orientation
  margin: number
}

async function decodeToJpeg(file: File): Promise<ArrayBuffer> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not create a 2D canvas context')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
  return blob.arrayBuffer()
}

async function embedImage(pdf: PDFDocument, file: File): Promise<PDFImage> {
  const bytes = await file.arrayBuffer()
  if (file.type === 'image/png') return pdf.embedPng(bytes)
  if (file.type === 'image/jpeg') return pdf.embedJpg(bytes)
  return pdf.embedJpg(await decodeToJpeg(file))
}

export async function imagesToPdf(
  files: File[],
  options: ImagesToPdfOptions,
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const pdf = await PDFDocument.create()

  for (const [index, file] of files.entries()) {
    const image = await embedImage(pdf, file)

    if (options.pageSize === 'fit') {
      const page = pdf.addPage([
        image.width + options.margin * 2,
        image.height + options.margin * 2,
      ])
      page.drawImage(image, {
        x: options.margin,
        y: options.margin,
        width: image.width,
        height: image.height,
      })
    } else {
      const [shortSide, longSide] = PAGE_DIMENSIONS[options.pageSize]
      const [pageWidth, pageHeight] =
        options.orientation === 'portrait' ? [shortSide, longSide] : [longSide, shortSide]
      const page = pdf.addPage([pageWidth, pageHeight])
      const maxWidth = pageWidth - options.margin * 2
      const maxHeight = pageHeight - options.margin * 2
      const scale = Math.min(maxWidth / image.width, maxHeight / image.height)
      const width = image.width * scale
      const height = image.height * scale
      page.drawImage(image, {
        x: (pageWidth - width) / 2,
        y: (pageHeight - height) / 2,
        width,
        height,
      })
    }

    onProgress?.((index + 1) / files.length)
  }

  const saved = await pdf.save()
  return new Blob([saved as BlobPart], { type: 'application/pdf' })
}
