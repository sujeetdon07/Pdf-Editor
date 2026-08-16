import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { ProgressBar } from '../components/ToolShell'
import { pptxToPdf } from '../lib/pptxToPdf'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function PowerpointToPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; slideCount: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function select(files: File[]) {
    const next = files[0]
    if (!next) return
    if (!/\.pptx$/i.test(next.name)) {
      setError('Please choose a .pptx file. Older .ppt presentations are not supported.')
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
      setResult(await pptxToPdf(file, setProgress))
    } catch (cause) {
      setError(describeFailure(cause, 'Could not convert this presentation.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="PowerPoint to PDF"
      description="Convert a .pptx deck to PDF, one page per slide at the deck's own slide size. Text and pictures are read straight out of the file, so any language renders."
      sidebar={
        <>
          <p className="mb-5 text-sm text-ink-700">
            Slide text, positions and images are reproduced. Transitions, animations, speaker notes
            and theme backgrounds are not.
          </p>
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
          accept=".pptx"
          label={file ? 'Choose another presentation' : 'Select a presentation'}
          hint="or drop a .pptx file here"
          onFiles={select}
        />

        {isWorking ? <ProgressBar ratio={progress} label="Rendering slides…" /> : null}
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
                  onClick={() => downloadBlob(result.blob, `${stripExtension(file.name)}.pdf`)}
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
