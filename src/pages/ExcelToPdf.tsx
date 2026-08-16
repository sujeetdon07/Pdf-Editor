import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import { sheetToPdf } from '../lib/sheetToPdf'
import type { DocOrientation, DocPageSize } from '../lib/htmlToPdf'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function ExcelToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [pageSize, setPageSize] = useState<DocPageSize>('a4')
  const [orientation, setOrientation] = useState<DocOrientation>('landscape')
  const [headerRow, setHeaderRow] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [pdf, setPdf] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  function select(files: File[]) {
    const next = files[0]
    if (!next) return
    if (!/\.(xlsx|xlsm|csv)$/i.test(next.name)) {
      setError('Please choose an .xlsx, .xlsm or .csv file.')
      return
    }
    setError(null)
    setPdf(null)
    setFile(next)
  }

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    setPdf(null)
    setProgress(0)
    try {
      const blob = await sheetToPdf(
        file,
        { pageSize, orientation, margin: 40, headerRow },
        setProgress,
      )
      setPdf(blob)
    } catch (cause) {
      setError(describeFailure(cause, 'Could not convert this spreadsheet.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="Excel to PDF"
      description="Convert .xlsx or .csv spreadsheets to PDF. Every sheet becomes a titled table, in any language; pages are printed as images, so tables look exactly as rendered."
      sidebar={
        <>
          <OptionGroup
            legend="Page size"
            value={pageSize}
            onChange={setPageSize}
            options={[
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'US Letter' },
            ]}
          />
          <OptionGroup
            legend="Orientation"
            value={orientation}
            onChange={setOrientation}
            options={[
              { value: 'landscape', label: 'Landscape', description: 'Best for wide tables' },
              { value: 'portrait', label: 'Portrait' },
            ]}
          />
          <label className="mb-5 flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              className="accent-rust-500"
              checked={headerRow}
              onChange={(event) => setHeaderRow(event.target.checked)}
            />
            First row is a header
          </label>
          <button
            type="button"
            disabled={!file || isWorking}
            onClick={run}
            className="btn-primary w-full"
          >
            {isWorking ? 'Converting…' : 'Convert to PDF'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <Dropzone
          accept=".xlsx,.xlsm,.csv"
          label={file ? 'Choose another spreadsheet' : 'Select a spreadsheet'}
          hint="or drop an .xlsx or .csv file here"
          onFiles={select}
        />

        {isWorking ? <ProgressBar ratio={progress} label="Rendering pages…" /> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {file ? (
          <div className="panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{file.name}</p>
                <p className="text-sm text-ink-500">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setPdf(null)
                }}
                className="btn-ghost"
              >
                Remove
              </button>
            </div>

            {pdf ? (
              <div className="mt-5 rounded-xl border border-paper-300 bg-paper-50 p-4">
                <p className="text-sm text-ink-700">
                  PDF ready · <span className="text-ink-900">{formatBytes(pdf.size)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => downloadBlob(pdf, `${stripExtension(file.name)}.pdf`)}
                  className="btn-primary mt-3"
                >
                  Download PDF
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToolShell>
  )
}
