import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import { compressPdf, type CompressResult, type CompressionLevel } from '../lib/compressPdf'
import { downloadBlob, formatBytes, stripExtension } from '../lib/files'

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<CompressionLevel>('recommended')
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<CompressResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!file) return
    setIsWorking(true)
    setError(null)
    setResult(null)
    setProgress(0)
    try {
      const compressed = await compressPdf(file, level, setProgress)
      setResult(compressed)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not compress this PDF.')
    } finally {
      setIsWorking(false)
    }
  }

  const savings =
    result && result.originalSize > 0
      ? Math.round((1 - result.compressedSize / result.originalSize) * 100)
      : 0

  return (
    <ToolShell
      title="Compress PDF"
      description="Reduce the size of your PDF by re-encoding each page."
      sidebar={
        <>
          <OptionGroup
            legend="Compression level"
            value={level}
            onChange={setLevel}
            options={[
              { value: 'low', label: 'Less compression', description: 'Best quality' },
              {
                value: 'recommended',
                label: 'Recommended',
                description: 'Good balance of quality and size',
              },
              { value: 'extreme', label: 'Extreme', description: 'Smallest file, lower quality' },
            ]}
          />
          <button
            type="button"
            disabled={!file || isWorking}
            onClick={run}
            className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isWorking ? 'Compressing…' : 'Compress PDF'}
          </button>
        </>
      }
    >
      {file ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-900">{file.name}</p>
              <p className="text-sm text-slate-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setResult(null)
                setError(null)
              }}
              className="text-sm font-medium text-slate-500 hover:text-brand-600"
            >
              Remove
            </button>
          </div>

          {isWorking ? (
            <div className="mt-6">
              <ProgressBar ratio={progress} />
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              {result.keptOriginal ? (
                <p className="text-sm text-slate-700">
                  This PDF is already well optimised — re-encoding made it larger, so the original
                  file is offered unchanged.
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  {formatBytes(result.originalSize)} → {formatBytes(result.compressedSize)} (
                  <span className="font-semibold text-green-600">{savings}% smaller</span>)
                </p>
              )}
              <button
                type="button"
                onClick={() =>
                  downloadBlob(result.blob, `${stripExtension(file.name)}-compressed.pdf`)
                }
                className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Download PDF
              </button>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        </div>
      ) : (
        <Dropzone
          accept="application/pdf"
          label="Select PDF file"
          hint="or drop a PDF here"
          onFiles={(files) => {
            setFile(files[0])
            setResult(null)
            setError(null)
          }}
        />
      )}
    </ToolShell>
  )
}
