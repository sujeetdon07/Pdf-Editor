import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import {
  pdfToImages,
  zipPages,
  type ImageFormat,
  type ImageQuality,
  type RenderedPage,
} from '../lib/pdfToImages'
import { downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImageFormat>('jpeg')
  const [quality, setQuality] = useState<ImageQuality>('normal')
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
      setPages(await pdfToImages(file, format, quality, setProgress))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not convert this PDF.')
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
      description="Render every page of a PDF as a JPG or PNG image."
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
          <OptionGroup
            legend="Resolution"
            value={quality}
            onChange={setQuality}
            options={[
              { value: 'normal', label: 'Normal', description: '~110 DPI' },
              { value: 'high', label: 'High', description: '~180 DPI, slower' },
            ]}
          />
          <button
            type="button"
            disabled={!file || isWorking}
            onClick={run}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isWorking ? 'Converting…' : 'Convert to images'}
          </button>
          {pages.length > 0 ? (
            <button
              type="button"
              onClick={downloadAll}
              className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Download all ({pages.length}) as ZIP
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
              <p className="text-sm text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                reset()
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
            onFiles={(files) => {
              setFile(files[0])
              reset()
              setError(null)
            }}
          />
        )}

        {isWorking ? <ProgressBar ratio={progress} /> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {pages.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {pages.map((page) => (
              <li key={page.pageNumber} className="rounded-xl border border-slate-200 bg-white p-3">
                <img
                  src={page.url}
                  alt={`Page ${page.pageNumber}`}
                  className="h-44 w-full rounded-lg border border-slate-100 object-contain"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                  <span>Page {page.pageNumber}</span>
                  <button
                    type="button"
                    onClick={() => downloadBlob(page.blob, page.filename)}
                    className="font-semibold text-brand-600 hover:underline"
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
