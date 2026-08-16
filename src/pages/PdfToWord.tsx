import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { ProgressBar } from '../components/ToolShell'
import { pdfToDocx, type PdfToDocxResult } from '../lib/pdfToDocx'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function PdfToWord() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<PdfToDocxResult | null>(null)
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
      setResult(await pdfToDocx(file, setProgress))
    } catch (cause) {
      setError(describeFailure(cause, 'Could not convert this PDF.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="PDF to Word"
      description="Extract the text of a PDF into an editable .docx document, keeping page breaks and heading sizes."
      sidebar={
        <>
          <p className="mb-5 text-sm text-ink-700">
            Text is pulled straight from the PDF, so any language stored in the file comes across.
            Scanned pages hold images rather than text and need OCR instead.
          </p>
          <button
            type="button"
            disabled={!file || isWorking}
            onClick={run}
            className="btn-primary w-full"
          >
            {isWorking ? 'Converting…' : 'Convert to Word'}
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

        {isWorking ? <ProgressBar ratio={progress} label="Extracting text…" /> : null}
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
                  {result.pageCount} page{result.pageCount > 1 ? 's' : ''} ·{' '}
                  {result.characters.toLocaleString()} characters ·{' '}
                  <span className="text-ink-900">{formatBytes(result.blob.size)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => downloadBlob(result.blob, `${stripExtension(file.name)}.docx`)}
                  className="btn-primary mt-3"
                >
                  Download Word file
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToolShell>
  )
}
