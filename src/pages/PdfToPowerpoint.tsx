import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import { pdfToPptx, type PdfToPptxResult } from '../lib/pdfToPptx'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

const DPI_OPTIONS = ['96', '150', '220'] as const
type Dpi = (typeof DPI_OPTIONS)[number]

export default function PdfToPowerpoint() {
  const [file, setFile] = useState<File | null>(null)
  const [dpi, setDpi] = useState<Dpi>('150')
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<PdfToPptxResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  function select(files: File[]) {
    const next = files[0]
    if (!next) return
    if (next.type !== 'application/pdf' && !/\.pdf$/i.test(next.name)) {
      setError('Please choose a PDF file.')
      return
    }
    setError(null)
    setResult(null)
    setFile(next)
  }

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    setResult(null)
    setProgress(0)
    try {
      setResult(await pdfToPptx(file, { dpi: Number(dpi), quality: 0.9 }, setProgress))
    } catch (cause) {
      setError(describeFailure(cause, 'Could not convert this PDF.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="PDF to PowerPoint"
      description="Turn each PDF page into a slide sized to that page, ready to present or annotate in PowerPoint, Keynote or Google Slides."
      sidebar={
        <>
          <OptionGroup
            legend="Slide resolution"
            value={dpi}
            onChange={setDpi}
            options={[
              { value: '96', label: '96 DPI', description: 'Smallest file' },
              { value: '150', label: '150 DPI', description: 'Balanced' },
              { value: '220', label: '220 DPI', description: 'Sharpest' },
            ]}
          />
          <p className="mb-5 text-sm text-ink-700">
            Pages become slide images, so the deck looks exactly like the PDF — text on the slides
            is not separately editable.
          </p>
          <button
            type="button"
            disabled={!file || isWorking}
            onClick={run}
            className="btn-primary w-full"
          >
            {isWorking ? 'Converting…' : 'Convert to PowerPoint'}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <Dropzone
          accept="application/pdf"
          label={file ? 'Choose another PDF' : 'Select a PDF'}
          hint="or drop a PDF here"
          onFiles={select}
        />

        {isWorking ? <ProgressBar ratio={progress} label="Building slides…" /> : null}
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
                  setResult(null)
                }}
                className="btn-ghost"
              >
                Remove
              </button>
            </div>

            {result ? (
              <div className="mt-5 rounded-xl border border-paper-300 bg-paper-50 p-4">
                <p className="text-sm text-ink-700">
                  {result.slideCount} slide{result.slideCount > 1 ? 's' : ''} ·{' '}
                  <span className="text-ink-900">{formatBytes(result.blob.size)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => downloadBlob(result.blob, `${stripExtension(file.name)}.pptx`)}
                  className="btn-primary mt-3"
                >
                  Download presentation
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToolShell>
  )
}
