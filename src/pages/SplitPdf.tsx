import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup } from '../components/ToolShell'
import { getPageCount, parseRanges, splitPdf, zipParts, type SplitPart } from '../lib/editPdf'
import { downloadBlob, formatBytes, stripExtension } from '../lib/files'

type SplitMode = 'ranges' | 'pages'

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [mode, setMode] = useState<SplitMode>('ranges')
  const [expression, setExpression] = useState('')
  const [parts, setParts] = useState<SplitPart[]>([])
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function selectFile(selected: File) {
    setFile(selected)
    setParts([])
    setError(null)
    try {
      const count = await getPageCount(selected)
      setPageCount(count)
      setExpression(`1-${count}`)
    } catch {
      setError('Could not read this PDF.')
    }
  }

  async function run() {
    if (!file) return
    if (pageCount === 0) {
      setError('Could not read this PDF.')
      return
    }
    setIsWorking(true)
    setError(null)
    setParts([])
    try {
      const ranges =
        mode === 'pages'
          ? Array.from({ length: pageCount }, (_, i) => ({ from: i + 1, to: i + 1 }))
          : parseRanges(expression, pageCount)
      setParts(await splitPdf(file, ranges, stripExtension(file.name)))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not split this PDF.')
    } finally {
      setIsWorking(false)
    }
  }

  async function downloadAll() {
    if (!file || parts.length === 0) return
    downloadBlob(await zipParts(parts), `${stripExtension(file.name)}-split.zip`)
  }

  return (
    <ToolShell
      title="Split PDF"
      description="Extract page ranges into separate PDF files, or split every page into its own file."
      sidebar={
        <>
          <OptionGroup
            legend="Split mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: 'ranges', label: 'Custom ranges', description: 'e.g. 1-3, 5, 8-10' },
              { value: 'pages', label: 'Every page', description: 'One PDF per page' },
            ]}
          />
          {mode === 'ranges' ? (
            <label className="mb-5 block text-sm">
              <span className="mb-1 block font-semibold text-slate-900">Pages</span>
              <input
                value={expression}
                onChange={(event) => setExpression(event.target.value)}
                placeholder="1-3, 5"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:border-brand-500"
              />
              {pageCount > 0 ? (
                <span className="mt-1 block text-xs text-slate-500">
                  This PDF has {pageCount} pages.
                </span>
              ) : null}
            </label>
          ) : null}
          <button
            type="button"
            disabled={!file || isWorking}
            onClick={run}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isWorking ? 'Splitting…' : 'Split PDF'}
          </button>
          {parts.length > 1 ? (
            <button
              type="button"
              onClick={downloadAll}
              className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Download all ({parts.length}) as ZIP
            </button>
          ) : null}
        </>
      }
    >
      <div className="space-y-6">
        {file ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">
                {formatBytes(file.size)}
                {pageCount > 0 ? ` · ${pageCount} pages` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setParts([])
                setPageCount(0)
                setError(null)
              }}
              className="text-sm font-medium text-slate-500 hover:text-brand-600"
            >
              Remove
            </button>
          </div>
        ) : (
          <Dropzone
            accept="application/pdf"
            label="Select PDF file"
            hint="or drop a PDF here"
            onFiles={(files) => void selectFile(files[0])}
          />
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {parts.length > 0 ? (
          <ul className="space-y-2">
            {parts.map((part) => (
              <li
                key={part.name}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{part.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(part.blob.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadBlob(part.blob, part.name)}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ToolShell>
  )
}
