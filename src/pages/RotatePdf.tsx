import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell from '../components/ToolShell'
import { rotatePdf } from '../lib/editPdf'
import { renderThumbnails } from '../lib/pdfToImages'
import { downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null)
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [rotations, setRotations] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    thumbnails.forEach((url) => URL.revokeObjectURL(url))
    setThumbnails([])
    setRotations([])
    setResult(null)
  }

  async function selectFile(selected: File) {
    reset()
    setFile(selected)
    setError(null)
    setIsLoading(true)
    try {
      const pages = await renderThumbnails(selected)
      setThumbnails(pages)
      setRotations(new Array(pages.length).fill(0))
    } catch {
      setError('Could not read this PDF.')
    } finally {
      setIsLoading(false)
    }
  }

  function rotate(index: number, delta: number) {
    setResult(null)
    setRotations((current) =>
      current.map((value, i) => (i === index ? (((value + delta) % 360) + 360) % 360 : value)),
    )
  }

  function rotateAll(delta: number) {
    setResult(null)
    setRotations((current) => current.map((value) => (((value + delta) % 360) + 360) % 360))
  }

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    try {
      setResult(await rotatePdf(file, rotations))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not rotate this PDF.')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="Rotate PDF"
      description="Turn individual pages or the whole document, then save a new PDF."
      sidebar={
        <>
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              disabled={thumbnails.length === 0}
              onClick={() => rotateAll(-90)}
              className="btn-ghost flex-1 disabled:opacity-40"
            >
              ⟲ Rotate all left
            </button>
            <button
              type="button"
              disabled={thumbnails.length === 0}
              onClick={() => rotateAll(90)}
              className="btn-ghost flex-1 disabled:opacity-40"
            >
              ⟳ Rotate all right
            </button>
          </div>
          <button
            type="button"
            disabled={!file || isWorking || thumbnails.length === 0}
            onClick={run}
            className="btn-primary w-full"
          >
            {isWorking ? 'Saving…' : 'Apply rotation'}
          </button>
          {result && file ? (
            <button
              type="button"
              onClick={() => downloadBlob(result, `${stripExtension(file.name)}-rotated.pdf`)}
              className="btn-ghost mt-3 w-full py-3"
            >
              Download PDF ({formatBytes(result.size)})
            </button>
          ) : null}
        </>
      }
    >
      <div className="space-y-6">
        {file ? (
          <div className="flex items-center justify-between gap-4 panel p-6">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{file.name}</p>
              <p className="text-sm text-ink-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                reset()
                setFile(null)
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
            onFiles={(files) => void selectFile(files[0])}
          />
        )}

        {isLoading ? <p className="text-sm text-ink-500">Rendering pages…</p> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {thumbnails.length > 0 ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {thumbnails.map((url, index) => (
              <li key={url} className="panel p-3">
                <div className="grid h-40 place-items-center overflow-hidden">
                  <img
                    src={url}
                    alt={`Page ${index + 1}`}
                    className="max-h-40 transition-transform"
                    style={{ transform: `rotate(${rotations[index]}deg)` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-300">
                  <span>Page {index + 1}</span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => rotate(index, -90)}
                      className="rounded px-2 py-1 text-ink-300 hover:bg-ink-800 hover:text-white"
                      aria-label={`Rotate page ${index + 1} left`}
                    >
                      ⟲
                    </button>
                    <button
                      type="button"
                      onClick={() => rotate(index, 90)}
                      className="rounded px-2 py-1 text-ink-300 hover:bg-ink-800 hover:text-white"
                      aria-label={`Rotate page ${index + 1} right`}
                    >
                      ⟳
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </ToolShell>
  )
}
