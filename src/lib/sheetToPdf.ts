import ExcelJS from 'exceljs'
import { htmlToPdf, type HtmlToPdfOptions } from './htmlToPdf'

const SHEET_CSS = `
  <style>
    h2 { font-size: 1.15em; margin: 0 0 0.6em; }
    table { border-collapse: collapse; width: 100%; margin: 0 0 1.6em; font-size: 12px; }
    td, th { border: 1px solid #cbd5e1; padding: 4px 7px; vertical-align: top; white-space: pre-line; }
    th { background: #f1f5f9; font-weight: 600; text-align: left; }
    td.num { text-align: right; font-variant-numeric: tabular-nums; }
  </style>
`

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString()
  if (typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text
    if ('richText' in value) return value.richText.map((run) => run.text).join('')
    if ('result' in value) return value.result === undefined ? '' : String(value.result)
    if ('hyperlink' in value) return value.hyperlink ?? ''
    return ''
  }
  return String(value)
}

/** RFC 4180 parsing, so quoted fields may contain commas and newlines. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]

    if (quoted) {
      if (char !== '"') {
        field += char
      } else if (text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = false
      }
      continue
    }

    if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += char
  }

  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((cell) => cell !== ''))
}

async function loadWorkbook(file: File): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook()
  const bytes = await file.arrayBuffer()
  if (/\.csv$/i.test(file.name)) {
    const sheet = workbook.addWorksheet('Sheet1')
    for (const row of parseCsv(new TextDecoder().decode(bytes))) sheet.addRow(row)
    return workbook
  }
  await workbook.xlsx.load(bytes)
  return workbook
}

function sheetToHtml(sheet: ExcelJS.Worksheet, showName: boolean, headerRow: boolean): string {
  const rows: string[] = []

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells: string[] = []
    row.eachCell({ includeEmpty: true }, (cell) => {
      const text = cellText(cell.value)
      const isHeader = headerRow && rowNumber === 1
      const tag = isHeader ? 'th' : 'td'
      const numeric = !isHeader && text !== '' && !Number.isNaN(Number(text))
      cells.push(`<${tag}${numeric ? ' class="num"' : ''}>${escapeHtml(text)}</${tag}>`)
    })
    rows.push(`<tr>${cells.join('')}</tr>`)
  })

  if (rows.length === 0) return ''
  const title = showName ? `<h2>${escapeHtml(sheet.name)}</h2>` : ''
  return `${title}<table>${rows.join('')}</table>`
}

export async function sheetToPdf(
  file: File,
  options: HtmlToPdfOptions & { headerRow: boolean },
  onProgress?: (ratio: number) => void,
): Promise<Blob> {
  const workbook = await loadWorkbook(file)
  const sheets = workbook.worksheets.filter((sheet) => sheet.rowCount > 0)
  if (sheets.length === 0) throw new Error('This spreadsheet has no readable rows.')

  const body = sheets
    .map((sheet) => sheetToHtml(sheet, sheets.length > 1, options.headerRow))
    .filter(Boolean)
    .join('')
  if (!body) throw new Error('This spreadsheet has no readable rows.')

  return htmlToPdf(`${SHEET_CSS}<div>${body}</div>`, options, onProgress)
}
