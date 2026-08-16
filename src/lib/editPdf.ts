import JSZip from 'jszip'
import { PDFDocument, degrees } from 'pdf-lib'

export async function mergePdfs(
  files: File[],
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const merged = await PDFDocument.create()

  for (const [index, file] of files.entries()) {
    const source = await PDFDocument.load(await file.arrayBuffer())
    const pages = await merged.copyPages(source, source.getPageIndices())
    pages.forEach((page) => merged.addPage(page))
    onProgress?.((index + 1) / files.length)
  }

  const saved = await merged.save()
  return new Blob([saved as BlobPart], { type: 'application/pdf' })
}

export interface PageRange {
  from: number
  to: number
}

/** Parses a range expression such as "1-3, 5, 8-10" into 1-based inclusive ranges. */
export function parseRanges(expression: string, pageCount: number): PageRange[] {
  const ranges: PageRange[] = []

  for (const part of expression.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(trimmed)
    if (!match) throw new Error(`"${trimmed}" is not a valid page range.`)
    const from = Number(match[1])
    const to = match[2] ? Number(match[2]) : from
    if (from < 1 || to > pageCount || from > to) {
      throw new Error(`Range "${trimmed}" is outside 1-${pageCount}.`)
    }
    ranges.push({ from, to })
  }

  if (ranges.length === 0) throw new Error('Enter at least one page range.')
  return ranges
}

export interface SplitPart {
  name: string
  blob: Blob
}

export async function splitPdf(
  file: File,
  ranges: PageRange[],
  baseName: string,
): Promise<SplitPart[]> {
  const source = await PDFDocument.load(await file.arrayBuffer())
  const parts: SplitPart[] = []

  for (const range of ranges) {
    const output = await PDFDocument.create()
    const indices = Array.from({ length: range.to - range.from + 1 }, (_, i) => range.from - 1 + i)
    const pages = await output.copyPages(source, indices)
    pages.forEach((page) => output.addPage(page))
    const saved = await output.save()
    const suffix = range.from === range.to ? `${range.from}` : `${range.from}-${range.to}`
    parts.push({
      name: `${baseName}-pages-${suffix}.pdf`,
      blob: new Blob([saved as BlobPart], { type: 'application/pdf' }),
    })
  }

  return parts
}

export async function zipParts(parts: SplitPart[]): Promise<Blob> {
  const zip = new JSZip()
  for (const part of parts) zip.file(part.name, part.blob)
  return zip.generateAsync({ type: 'blob' })
}

/** Applies a per-page rotation delta (in degrees) on top of each page's existing rotation. */
export async function rotatePdf(file: File, rotations: number[]): Promise<Blob> {
  const pdf = await PDFDocument.load(await file.arrayBuffer())

  pdf.getPages().forEach((page, index) => {
    const delta = rotations[index] ?? 0
    if (delta === 0) return
    const next = (((page.getRotation().angle + delta) % 360) + 360) % 360
    page.setRotation(degrees(next))
  })

  const saved = await pdf.save()
  return new Blob([saved as BlobPart], { type: 'application/pdf' })
}

export async function getPageCount(file: File): Promise<number> {
  const pdf = await PDFDocument.load(await file.arrayBuffer())
  return pdf.getPageCount()
}
