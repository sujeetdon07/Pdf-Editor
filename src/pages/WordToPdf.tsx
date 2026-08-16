import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import { docxToPdf } from '../lib/docxToPdf'
import type { DocOrientation, DocPageSize } from '../lib/htmlToPdf'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function WordToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [pageSize, setPageSize] = useState<DocPageSize>('a4')
  const [orientation, setOrientation] = useState<DocOrientation>('portrait')
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [pdf, setPdf] = useState<Blob | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function select(files: File[]) {
    const next = files[0]
    if (!next) return
    if (!/\.docx$/i.test(next.name)) {
      setError('Please choose a .docx file. Legacy .doc files are not supported.')
      return
    }
    setError(null)
    setWarnings([])
    setPdf(null)
    setFile(next)
  }

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    setWarnings([])
    setPdf(null)
    setProgress(0)
    try {
      const result = await docxToPdf(file, { pageSize, orientation, margin: 64 }, setProgress)
      setPdf(result.blob)
      setWarnings(result.warnings)
    } catch (cause) {
      setError(describeFailure(cause, 'Could not convert this document.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="Word to PDF"
      description="Turn a .docx document into a PDF. Text is laid out by your browser, so every language renders exactly as you see it on screen — pages are printed as images, so the output is a faithful picture of the document rather than selectable text."
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
              { value: 'portrait', label: 'Portrait' },
              { value: 'landscape', label: 'Landscape' },
            ]}
          />
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
          accept=".docx"
          label={file ? 'Choose another document' : 'Select a Word document'}
          hint="or drop a .docx file here"
          onFiles={select}
        />

        {isWorking ? <ProgressBar ratio={progress} label="Rendering pages…" /> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {file ? (
          <div className="panel p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{file.name}</p>
                <p className="text-sm text-ink-500">{formatBytes(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setPdf(null)
                  setWarnings([])
                }}
                className="btn-ghost"
              >
                Remove
              </button>
            </div>

            {pdf ? (
              <div className="mt-5 rounded-xl border border-ink-800 bg-ink-950 p-4">
                <p className="text-sm text-ink-300">
                  PDF ready · <span className="text-white">{formatBytes(pdf.size)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => downloadBlob(pdf, `${stripExtension(file.name)}.pdf`)}
                  className="btn-primary mt-3"
                >
                  Download PDF
                </button>
                {warnings.length > 0 ? (
                  <p className="mt-3 text-xs text-amber-400">
                    {warnings.length} formatting note{warnings.length > 1 ? 's' : ''}:{' '}
                    {warnings.slice(0, 3).join('; ')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </ToolShell>
  )
}
