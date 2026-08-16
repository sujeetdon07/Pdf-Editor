import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { ProgressBar } from '../components/ToolShell'
import { mergePdfs } from '../lib/editPdf'
import { downloadBlob, formatBytes } from '../lib/files'

interface Item {
  id: string
  file: File
}

export default function MergePdf() {
  const [items, setItems] = useState<Item[]>([])
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [merged, setMerged] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  function addFiles(files: File[]) {
    const pdfs = files.filter((file) => file.type === 'application/pdf')
    if (pdfs.length === 0) {
      setError('Please choose PDF files.')
      return
    }
    setError(null)
    setMerged(null)
    setItems((current) => [
      ...current,
      ...pdfs.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
      })),
    ])
  }

  function move(index: number, delta: number) {
    setMerged(null)
    setItems((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function run() {
    if (items.length < 2) {
      setError('Add at least two PDFs to merge.')
      return
    }
    setIsWorking(true)
    setError(null)
    setMerged(null)
    setProgress(0)
    try {
      setMerged(await mergePdfs(items.map((item) => item.file), setProgress))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not merge these PDFs.')
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="Merge PDF"
      description="Combine several PDFs into a single document, in the order you choose."
      sidebar={
        <>
          <p className="mb-4 text-sm text-slate-600">
            {items.length} file{items.length === 1 ? '' : 's'} selected
          </p>
          <button
            type="button"
            disabled={items.length < 2 || isWorking}
            onClick={run}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isWorking ? 'Merging…' : 'Merge PDFs'}
          </button>
          {merged ? (
            <button
              type="button"
              onClick={() => downloadBlob(merged, 'merged.pdf')}
              className="mt-3 w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Download PDF ({formatBytes(merged.size)})
            </button>
          ) : null}
        </>
      }
    >
      <div className="space-y-6">
        <Dropzone
          accept="application/pdf"
          multiple
          label={items.length > 0 ? 'Add more PDFs' : 'Select PDF files'}
          hint="or drop PDFs here"
          onFiles={addFiles}
        />

        {isWorking ? <ProgressBar ratio={progress} /> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {items.length > 0 ? (
          <ol className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-semibold">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.file.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(item.file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  className="rounded px-2 py-1 text-sm hover:bg-slate-100"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  className="rounded px-2 py-1 text-sm hover:bg-slate-100"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMerged(null)
                    setItems((current) => current.filter((c) => c.id !== item.id))
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-brand-600"
                >
                  Remove
                </button>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </ToolShell>
  )
}
