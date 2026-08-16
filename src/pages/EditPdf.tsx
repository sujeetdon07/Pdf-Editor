import { useEffect, useRef, useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import { canvasToBlob, loadPdf, renderPageToCanvas } from '../lib/pdfjs'
import { stampPdf, type Mark, type MarkKind } from '../lib/stampPdf'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

interface Preview {
  url: string
  /** Page size in PDF points. */
  width: number
  height: number
}

const PREVIEW_SCALE = 1.5
const COLORS = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#f59e0b']

async function renderPreviews(file: File): Promise<Preview[]> {
  const pdf = await loadPdf(await file.arrayBuffer())
  const previews: Preview[] = []

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const [, , width, height] = page.view
      page.cleanup()
      const canvas = await renderPageToCanvas(pdf, pageNumber, PREVIEW_SCALE)
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.85)
      previews.push({ url: URL.createObjectURL(blob), width, height })
      canvas.width = 0
      canvas.height = 0
    }
  } finally {
    await pdf.destroy()
  }

  return previews
}

export default function EditPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [previews, setPreviews] = useState<Preview[]>([])
  const [page, setPage] = useState(1)
  const [kind, setKind] = useState<MarkKind>('text')
  const [text, setText] = useState('')
  const [size, setSize] = useState(16)
  const [color, setColor] = useState(COLORS[1])
  const [marks, setMarks] = useState<Mark[]>([])
  const [drag, setDrag] = useState<{ x: number; y: number; toX: number; toY: number } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWorking, setIsWorking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [surfaceWidth, setSurfaceWidth] = useState(0)
  const surface = useRef<HTMLDivElement>(null)

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews])

  useEffect(() => {
    const element = surface.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => setSurfaceWidth(entry.contentRect.width))
    observer.observe(element)
    return () => observer.disconnect()
  }, [previews.length])

  async function select(files: File[]) {
    const next = files[0]
    if (!next) return
    if (next.type !== 'application/pdf' && !/\.pdf$/i.test(next.name)) {
      setError('Please choose a PDF file.')
      return
    }
    setError(null)
    setResult(null)
    setMarks([])
    setPage(1)
    setFile(next)
    setIsLoading(true)
    try {
      setPreviews(await renderPreviews(next))
    } catch {
      setError('Could not read this PDF.')
    } finally {
      setIsLoading(false)
    }
  }

  function pointOf(event: React.PointerEvent): { x: number; y: number } | null {
    const bounds = surface.current?.getBoundingClientRect()
    if (!bounds) return null
    return {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    }
  }

  function addMark(mark: Omit<Mark, 'id' | 'page'>) {
    setResult(null)
    setMarks((current) => [
      ...current,
      { ...mark, id: `${Date.now()}-${current.length}`, page },
    ])
  }

  function down(event: React.PointerEvent) {
    const point = pointOf(event)
    if (!point) return

    if (kind === 'text') {
      if (!text.trim()) {
        setError('Type the text to place first.')
        return
      }
      setError(null)
      addMark({ kind, x: point.x, y: point.y, width: 0, height: 0, text, size, color })
      return
    }

    setError(null)
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ x: point.x, y: point.y, toX: point.x, toY: point.y })
  }

  function move(event: React.PointerEvent) {
    if (!drag) return
    const point = pointOf(event)
    if (point) setDrag({ ...drag, toX: point.x, toY: point.y })
  }

  function up() {
    if (!drag) return
    const x = Math.min(drag.x, drag.toX)
    const y = Math.min(drag.y, drag.toY)
    const width = Math.abs(drag.toX - drag.x)
    const height = Math.abs(drag.toY - drag.y)
    setDrag(null)
    if (width < 0.005 || height < 0.005) return
    addMark({ kind, x, y, width, height, text: '', size, color })
  }

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    setResult(null)
    setProgress(0)
    try {
      setResult(await stampPdf(file, marks, setProgress))
    } catch (cause) {
      setError(describeFailure(cause, 'Could not save this PDF.'))
    } finally {
      setIsWorking(false)
    }
  }

  const preview = previews[page - 1]
  const pageMarks = marks.filter((mark) => mark.page === page)

  return (
    <ToolShell
      title="Edit PDF"
      description="Add text, highlights and white-out blocks anywhere on a page, then save a new PDF. Edits are drawn by the browser, so any language can be typed in."
      sidebar={
        <>
          <OptionGroup
            legend="Tool"
            value={kind}
            onChange={setKind}
            options={[
              { value: 'text', label: 'Text', description: 'Click to place' },
              { value: 'highlight', label: 'Highlight', description: 'Drag a box' },
              { value: 'whiteout', label: 'White-out', description: 'Cover content' },
            ]}
          />

          {kind === 'text' ? (
            <div className="mb-5 space-y-3">
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={3}
                placeholder="Text to place"
                className="w-full rounded-xl border border-paper-300 bg-paper-50 p-3 text-sm text-ink-900 outline-none focus:border-rust-500"
              />
              <label className="flex items-center justify-between text-sm text-ink-700">
                Size
                <input
                  type="number"
                  min={6}
                  max={96}
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value) || 16)}
                  className="w-20 rounded-lg border border-paper-300 bg-paper-50 px-2 py-1 text-right text-ink-900 outline-none focus:border-rust-500"
                />
              </label>
            </div>
          ) : null}

          {kind !== 'whiteout' ? (
            <div className="mb-5 flex gap-2">
              {COLORS.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  aria-label={`Use ${swatch}`}
                  onClick={() => setColor(swatch)}
                  style={{ background: swatch }}
                  className={`h-7 w-7 rounded-full border-2 ${color === swatch ? 'border-ink-900' : 'border-paper-300'}`}
                />
              ))}
            </div>
          ) : null}

          <div className="mb-5 flex gap-2">
            <button
              type="button"
              disabled={marks.length === 0}
              onClick={() => {
                setResult(null)
                setMarks((current) => current.slice(0, -1))
              }}
              className="btn-ghost flex-1 disabled:opacity-40"
            >
              Undo
            </button>
            <button
              type="button"
              disabled={marks.length === 0}
              onClick={() => {
                setResult(null)
                setMarks([])
              }}
              className="btn-ghost flex-1 disabled:opacity-40"
            >
              Clear
            </button>
          </div>

          <button
            type="button"
            disabled={!file || isWorking || marks.length === 0}
            onClick={run}
            className="btn-primary w-full"
          >
            {isWorking ? 'Saving…' : `Apply ${marks.length} edit${marks.length === 1 ? '' : 's'}`}
          </button>

          {result && file ? (
            <button
              type="button"
              onClick={() => downloadBlob(result, `${stripExtension(file.name)}-edited.pdf`)}
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
          <div className="panel flex items-center justify-between gap-4 p-5">
            <div className="min-w-0">
              <p className="truncate font-medium text-ink-900">{file.name}</p>
              <p className="text-sm text-ink-500">
                {formatBytes(file.size)} · {previews.length} pages
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setPreviews([])
                setMarks([])
                setResult(null)
              }}
              className="btn-ghost"
            >
              Remove
            </button>
          </div>
        ) : (
          <Dropzone
            accept="application/pdf"
            label="Select a PDF"
            hint="or drop a PDF here"
            onFiles={select}
          />
        )}

        {isLoading ? <p className="text-sm text-ink-500">Rendering pages…</p> : null}
        {isWorking ? <ProgressBar ratio={progress} label="Stamping pages…" /> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}

        {preview ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="btn-ghost disabled:opacity-40"
                >
                  ‹ Previous
                </button>
                <span className="text-sm text-ink-700">
                  Page {page} of {previews.length}
                </span>
                <button
                  type="button"
                  disabled={page === previews.length}
                  onClick={() => setPage((current) => current + 1)}
                  className="btn-ghost disabled:opacity-40"
                >
                  Next ›
                </button>
              </div>
              <span className="text-sm text-ink-500">
                {pageMarks.length} edit{pageMarks.length === 1 ? '' : 's'} on this page
              </span>
            </div>

            <div
              ref={surface}
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              className="relative mx-auto w-full max-w-3xl cursor-crosshair select-none overflow-hidden rounded-xl border border-paper-300 bg-white"
              style={{ aspectRatio: `${preview.width} / ${preview.height}` }}
            >
              <img src={preview.url} alt={`Page ${page}`} className="pointer-events-none w-full" />

              {pageMarks.map((mark) =>
                mark.kind === 'text' ? (
                  <span
                    key={mark.id}
                    className="pointer-events-none absolute whitespace-pre"
                    style={{
                      left: `${mark.x * 100}%`,
                      top: `${mark.y * 100}%`,
                      color: mark.color,
                      // Mark sizes are PDF points; the preview is the page scaled to its box.
                      fontSize: `${mark.size * (surfaceWidth / preview.width)}px`,
                      lineHeight: 1.3,
                    }}
                  >
                    {mark.text}
                  </span>
                ) : (
                  <span
                    key={mark.id}
                    className="pointer-events-none absolute"
                    style={{
                      left: `${mark.x * 100}%`,
                      top: `${mark.y * 100}%`,
                      width: `${mark.width * 100}%`,
                      height: `${mark.height * 100}%`,
                      background: mark.kind === 'whiteout' ? '#ffffff' : mark.color,
                      opacity: mark.kind === 'whiteout' ? 1 : 0.35,
                    }}
                  />
                ),
              )}

              {drag ? (
                <span
                  className="pointer-events-none absolute border-2 border-dashed border-rust-400"
                  style={{
                    left: `${Math.min(drag.x, drag.toX) * 100}%`,
                    top: `${Math.min(drag.y, drag.toY) * 100}%`,
                    width: `${Math.abs(drag.toX - drag.x) * 100}%`,
                    height: `${Math.abs(drag.toY - drag.y) * 100}%`,
                  }}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </ToolShell>
  )
}
