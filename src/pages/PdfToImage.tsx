import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import {
  MAX_DPI,
  MIN_DPI,
  clampDpi,
  pdfToImages,
  zipPages,
  type ImageFormat,
  type RenderedPage,
} from '../lib/pdfToImages'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

const DPI_PRESETS = [72, 150, 300, 600]

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImageFormat>('jpeg')
  const [dpi, setDpi] = useState(150)
  const [pages, setPages] = useState<RenderedPage[]>([])
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    pages.forEach((page) => URL.revokeObjectURL(page.url))
    setPages([])
  }

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    reset()
    setProgress(0)
    try {
      setPages(await pdfToImages(file, format, clampDpi(dpi), setProgress))
    } catch (cause) {
      setError(describeFailure(cause, 'Could not convert this PDF.'))
    } finally {
      setIsWorking(false)
    }
  }

  async function downloadAll() {
    if (!file || pages.length === 0) return
    const zip = await zipPages(pages)
    downloadBlob(zip, `${stripExtension(file.name)}-images.zip`)
  }

  return (
    <ToolShell
      title="PDF to Image"
      description="Render pages as JPG or PNG at the exact resolution you need, from screen size up to print."
      sidebar={
        <>
          <OptionGroup
            legend="Image format"
            value={format}
            onChange={setFormat}
            options={[
              { value: 'jpeg', label: 'JPG', description: 'Smaller files' },
              { value: 'png', label: 'PNG', description: 'Lossless quality' },
            ]}
          />

          <div className="mb-5">
            <label
              htmlFor="dpi"
              className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink-500"
            >
              Resolution (DPI)
            </label>
            <div className="mb-3 flex flex-wrap gap-2">
              {DPI_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDpi(preset)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    dpi === preset
                      ? 'border-rust-500 bg-rust-500/15 text-ink-900'
                      : 'border-paper-300 text-ink-700 hover:border-paper-400'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              id="dpi"
              type="number"
              min={MIN_DPI}
              max={MAX_DPI}
              value={dpi}
              onChange={(event) => setDpi(Number(event.target.value))}
              onBlur={() => setDpi(clampDpi(dpi))}
              className="field"
            />
            <p className="mt-2 text-xs text-ink-500">
              {MIN_DPI}–{MAX_DPI} DPI. 300 is print quality; high values on long documents use a lot
              of memory.
            </p>
          </div>

          <button type="button" disabled={!file || isWorking} onClick={run} className="btn-primary w-full">
            {isWorking ? 'Converting…' : 'Convert to images'}
          </button>
          {pages.length > 0 ? (
            <button type="button" onClick={downloadAll} className="btn-ghost mt-3 w-full py-3">
              Download all ({pages.length}) as ZIP
            </button>
          ) : null}
        </>
      }
    >
      <div className="space-y-6">
        {file ? (
          <div className="panel flex items-center justify-between gap-4 p-6">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{file.name}</p>
              <p className="text-sm text-ink-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                reset()
                setError(null)
              }}
              className="btn-ghost"
            >
              Remove
            </button>
          </div>
        ) : (
          <Dropzone
            accept="application/pdf"
            label="Select PDF file"
            hint="or drop a PDF here"
            onFiles={(files) => {
              setFile(files[0])
              reset()
              setError(null)
            }}
          />
        )}

        {isWorking ? <ProgressBar ratio={progress} /> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {pages.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {pages.map((page) => (
              <li key={page.pageNumber} className="panel p-3">
                <img
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  className="h-44 w-full rounded-lg border border-paper-300 bg-paper-50 object-contain"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-ink-700">
                  <span>
                    Page {page.pageNumber} · {page.width}×{page.height}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadBlob(page.blob, page.filename)}
                    className="font-semibold text-rust-600 hover:text-ink-900"
                  >
                    Download
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ToolShell>
  )
}
