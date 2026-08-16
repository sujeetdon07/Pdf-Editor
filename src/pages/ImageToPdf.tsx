import { useEffect, useMemo, useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import {
  imagesToPdf,
  type Orientation,
  type PageSize,
} from '../lib/imagesToPdf'
import { describeFailure, downloadBlob, formatBytes } from '../lib/files'

interface Item {
  id: string
  file: File
  url: string
}

export default function ImageToPdf() {
  const [items, setItems] = useState<Item[]>([])
  const [pageSize, setPageSize] = useState<PageSize>('fit')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [withMargin, setWithMargin] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [pdf, setPdf] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => () => items.forEach((item) => URL.revokeObjectURL(item.url)), [items])

  const totalSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  )

  function addFiles(files: File[]) {
    const images = files.filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) {
      setError('Please choose image files (JPG, PNG or WebP).')
      return
    }
    setError(null)
    setPdf(null)
    setItems((current) => [
      ...current,
      ...images.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        url: URL.createObjectURL(file),
      })),
    ])
  }

  function move(index: number, delta: number) {
    setPdf(null)
    setItems((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function run() {
    if (items.length === 0) return
    setIsWorking(true)
    setError(null)
    setPdf(null)
    setProgress(0)
    try {
      const blob = await imagesToPdf(
        items.map((item) => item.file),
        { pageSize, orientation, margin: withMargin ? 24 : 0 },
        setProgress,
      )
      setPdf(blob)
    } catch (cause) {
      setError(describeFailure(cause, 'Could not build the PDF.'))
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <ToolShell
      title="Image to PDF"
      description="Combine JPG, PNG and WebP images into one PDF. Drag order is respected."
      sidebar={
        <>
          <OptionGroup
            legend="Page size"
            value={pageSize}
            onChange={setPageSize}
            options={[
              { value: 'fit', label: 'Fit to image', description: 'One page per image size' },
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'US Letter' },
            ]}
          />
          {pageSize !== 'fit' ? (
            <OptionGroup
              legend="Orientation"
              value={orientation}
              onChange={setOrientation}
              options={[
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
            />
          ) : null}
          <label className="mb-5 flex items-center gap-2 text-sm text-ink-300">
            <input
              type="checkbox"
              className="accent-iris-500"
              checked={withMargin}
              onChange={(event) => setWithMargin(event.target.checked)}
            />
            Add page margin
          </label>
          <button
            type="button"
            disabled={items.length === 0 || isWorking}
            onClick={run}
            className="btn-primary w-full"
          >
            {isWorking ? 'Converting…' : 'Convert to PDF'}
          </button>
          {pdf ? (
            <button
              type="button"
              onClick={() => downloadBlob(pdf, 'images.pdf')}
              className="btn-ghost mt-3 w-full py-3"
            >
              Download PDF ({formatBytes(pdf.size)})
            </button>
          ) : null}
        </>
      }
    >
      <div className="space-y-6">
        <Dropzone
          accept="image/*"
          multiple
          label={items.length > 0 ? 'Add more images' : 'Select images'}
          hint="or drop JPG, PNG and WebP files here"
          onFiles={addFiles}
        />

        {isWorking ? <ProgressBar ratio={progress} /> : null}
        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        {items.length > 0 ? (
          <div className="panel p-5">
            <p className="mb-4 text-sm text-ink-500">
              {items.length} image{items.length > 1 ? 's' : ''} · {formatBytes(totalSize)}
            </p>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((item, index) => (
                <li key={item.id} className="panel p-2">
                  <img
                    src={item.url}
                    alt={item.file.name}
                    className="h-32 w-full rounded-lg object-contain"
                  />
                  <p className="mt-2 truncate text-xs text-ink-300">{item.file.name}</p>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        className="rounded px-2 py-1 text-ink-300 hover:bg-ink-800 hover:text-white"
                        aria-label="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        className="rounded px-2 py-1 text-ink-300 hover:bg-ink-800 hover:text-white"
                        aria-label="Move right"
                      >
                        →
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPdf(null)
                        setItems((current) => current.filter((c) => c.id !== item.id))
                      }}
                      className="text-iris-300 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </ToolShell>
  )
}
