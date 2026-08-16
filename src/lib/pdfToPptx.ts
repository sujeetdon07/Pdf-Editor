import PptxGenJS from 'pptxgenjs'
import { canvasToBlob, loadPdf, renderPageToCanvas } from './pdfjs'

/** PDF points are 72 per inch, which is also PptxGenJS' unit of choice. */
const POINTS_PER_INCH = 72

async function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): Promise<string> {
  const blob = await canvasToBlob(canvas, 'image/jpeg', quality)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Could not read the rendered page'))
    reader.readAsDataURL(blob)
  })
}

export interface PdfToPptxOptions {
  /** Rendering resolution of each slide image. */
  dpi: number
  quality: number
}

export interface PdfToPptxResult {
  blob: Blob
  slideCount: number
}

/** Each PDF page becomes a full-bleed slide sized to that page. */
export async function pdfToPptx(
  file: File,
  options: PdfToPptxOptions,
  onProgress?: (ratio: number) => void,
): Promise<PdfToPptxResult> {
  const pdf = await loadPdf(await file.arrayBuffer())
  const scale = options.dpi / POINTS_PER_INCH

  try {
    const pptx = new PptxGenJS()
    const first = await pdf.getPage(1)
    const [, , pageWidth, pageHeight] = first.view
    const width = pageWidth / POINTS_PER_INCH
    const height = pageHeight / POINTS_PER_INCH
    first.cleanup()

    pptx.defineLayout({ name: 'PDF', width, height })
    pptx.layout = 'PDF'

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const canvas = await renderPageToCanvas(pdf, pageNumber, scale)
      const data = await canvasToDataUrl(canvas, options.quality)
      // Pages that differ from the first are fitted into the deck's layout.
      const fit = Math.min(width / (canvas.width / options.dpi), height / (canvas.height / options.dpi))
      const imageWidth = (canvas.width / options.dpi) * fit
      const imageHeight = (canvas.height / options.dpi) * fit
      const slide = pptx.addSlide()
      slide.addImage({
        data,
        x: (width - imageWidth) / 2,
        y: (height - imageHeight) / 2,
        w: imageWidth,
        h: imageHeight,
      })

      canvas.width = 0
      canvas.height = 0
      onProgress?.(pageNumber / pdf.numPages)
    }

    const blob = (await pptx.write({ outputType: 'blob' })) as Blob
    return { blob, slideCount: pdf.numPages }
  } finally {
    await pdf.destroy()
  }
}
