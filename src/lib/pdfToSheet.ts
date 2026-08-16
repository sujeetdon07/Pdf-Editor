import ExcelJS from 'exceljs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import { loadPdf } from './pdfjs'

interface Word {
  text: string
  x: number
  width: number
}

interface Row {
  y: number
  words: Word[]
}

/** Gap between two words, relative to font size, that starts a new column. */
const COLUMN_GAP = 1.2
/** Distance between column edges, in points, that still counts as the same column. */
const COLUMN_TOLERANCE = 12

function toRows(items: TextItem[], tolerance: number): Row[] {
  const rows: Row[] = []

  for (const item of items) {
    if (!item.str.trim()) continue
    const y = item.transform[5]
    const word: Word = { text: item.str.trim(), x: item.transform[4], width: item.width }
    const row = rows.find((candidate) => Math.abs(candidate.y - y) <= tolerance)
    if (row) row.words.push(word)
    else rows.push({ y, words: [word] })
  }

  for (const row of rows) row.words.sort((a, b) => a.x - b.x)
  return rows.sort((a, b) => b.y - a.y)
}

/** Merge words separated by less than one space into a single cell. */
function toCells(row: Row, fontSize: number): Word[] {
  const cells: Word[] = []

  for (const word of row.words) {
    const previous = cells[cells.length - 1]
    if (previous && word.x - (previous.x + previous.width) < fontSize * COLUMN_GAP) {
      previous.text = `${previous.text} ${word.text}`
      previous.width = word.x + word.width - previous.x
      continue
    }
    cells.push({ ...word })
  }

  return cells
}

/** Column left edges shared by the whole page, so cells line up across rows. */
function columnEdges(rows: Word[][]): number[] {
  const edges: number[] = []

  for (const cells of rows) {
    for (const cell of cells) {
      if (!edges.some((edge) => Math.abs(edge - cell.x) <= COLUMN_TOLERANCE)) edges.push(cell.x)
    }
  }

  return edges.sort((a, b) => a - b)
}

function columnIndex(edges: number[], x: number): number {
  let index = 0
  for (let candidate = 0; candidate < edges.length; candidate += 1) {
    if (x >= edges[candidate] - COLUMN_TOLERANCE) index = candidate
  }
  return index
}

function numeric(text: string): number | null {
  const cleaned = text.replace(/[\s,]/g, '')
  if (!/^-?\d+(\.\d+)?%?$/.test(cleaned)) return null
  const value = Number(cleaned.replace('%', ''))
  return Number.isNaN(value) ? null : value
}

export interface PdfToSheetResult {
  blob: Blob
  pageCount: number
  rowCount: number
}

/**
 * Rebuild the tabular structure of a PDF as a workbook: one sheet per page,
 * with columns inferred from where text sits on the page.
 */
export async function pdfToSheet(
  file: File,
  options: { numbersAsValues: boolean },
  onProgress?: (ratio: number) => void,
): Promise<PdfToSheetResult> {
  const pdf = await loadPdf(await file.arrayBuffer())
  const workbook = new ExcelJS.Workbook()
  let rowCount = 0

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()
      const items = content.items.filter((item): item is TextItem => 'str' in item)
      const fontSize =
        items.length > 0
          ? items.reduce((total, item) => total + (item.height || 10), 0) / items.length
          : 10

      const rows = toRows(items, Math.max(2, fontSize * 0.4)).map((row) => toCells(row, fontSize))
      const edges = columnEdges(rows)
      const sheet = workbook.addWorksheet(`Page ${pageNumber}`)

      for (const cells of rows) {
        const values: (string | number)[] = []
        for (const cell of cells) {
          const index = columnIndex(edges, cell.x)
          const value = options.numbersAsValues ? numeric(cell.text) : null
          values[index] = value ?? cell.text
        }
        for (let index = 0; index < values.length; index += 1) {
          if (values[index] === undefined) values[index] = ''
        }
        sheet.addRow(values)
        rowCount += 1
      }

      for (let column = 1; column <= edges.length; column += 1) {
        sheet.getColumn(column).width = 24
      }

      page.cleanup()
      onProgress?.(pageNumber / pdf.numPages)
    }

    if (rowCount === 0) {
      throw new Error(
        'No selectable text was found — this PDF is probably a scan, which needs OCR.',
      )
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    return { blob, pageCount: pdf.numPages, rowCount }
  } finally {
    await pdf.destroy()
  }
}
