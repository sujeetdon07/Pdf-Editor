import { useState } from 'react'
import Dropzone from '../components/Dropzone'
import ToolShell, { OptionGroup, ProgressBar } from '../components/ToolShell'
import {
  compressPdf,
  type CompressMode,
  type CompressResult,
  type CompressionLevel,
} from '../lib/compressPdf'
import { describeFailure, downloadBlob, formatBytes, stripExtension } from '../lib/files'

type SizeUnit = 'KB' | 'MB'

export default function CompressPdf() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<CompressMode>('level')
  const [level, setLevel] = useState<CompressionLevel>('recommended')
  const [targetValue, setTargetValue] = useState('500')
  const [targetUnit, setTargetUnit] = useState<SizeUnit>('KB')
  const [progress, setProgress] = useState(0)
  const [isWorking, setIsWorking] = useState(false)
  const [result, setResult] = useState<CompressResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const targetBytes =
    Number(targetValue) > 0
      ? Math.round(Number(targetValue) * (targetUnit === 'MB' ? 1024 * 1024 : 1024))
      : 0

  async function run() {
    if (!file) return
    if (mode === 'target' && targetBytes <= 0) {
      setError('Enter a target size greater than zero.')
      return
    }
    setIsWorking(true)
    setError(null)
    setResult(null)
    setProgress(0)
    try {
      setResult(await compressPdf(file, { mode, level, targetBytes }, setProgress))
    } catch (cause) {
      setError(describeFailure(cause, 'Could not compress this PDF.'))
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
      description="Re-encode pages to shrink a document — either by quality preset or down to a size you choose."
      sidebar={
        <>
          <OptionGroup
            legend="Mode"
            value={mode}
            onChange={(next) => {
              setMode(next)
              setResult(null)
            }}
            options={[
              { value: 'level', label: 'Quality preset', description: 'One pass, predictable' },
              {
                value: 'target',
                label: 'Target file size',
                description: 'Retries until it fits',
              },
            ]}
          />

          {mode === 'level' ? (
            <OptionGroup
              legend="Compression level"
              value={level}
              onChange={setLevel}
              options={[
                { value: 'low', label: 'Light', description: '150 DPI · best quality' },
                { value: 'recommended', label: 'Balanced', description: '110 DPI · good all-round' },
                { value: 'extreme', label: 'Aggressive', description: '72 DPI · smallest file' },
              ]}
            />
          ) : (
            <div className="mb-5">
              <label
                htmlFor="target-size"
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-ink-500"
              >
                Target size
              </label>
              <div className="flex gap-2">
                <input
                  id="target-size"
                  type="number"
                  min={1}
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                  className="field"
                />
                <select
                  aria-label="Size unit"
                  value={targetUnit}
                  onChange={(event) => setTargetUnit(event.target.value as SizeUnit)}
                  className="field w-24"
                >
                  <option value="KB">KB</option>
                  <option value="MB">MB</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-ink-500">
                Quality is lowered step by step until the file fits, so very small targets take
                longer.
              </p>
            </div>
          )}

          <button type="button" disabled={!file || isWorking} onClick={run} className="btn-primary w-full">
            {isWorking ? 'Compressing…' : 'Compress PDF'}
          </button>
        </>
      }
    >
      {file ? (
        <div className="panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{file.name}</p>
              <p className="text-sm text-ink-500">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFile(null)
                setResult(null)
                setError(null)
              }}
              className="btn-ghost"
            >
              Remove
            </button>
          </div>

          {isWorking ? (
            <div className="mt-6">
              <ProgressBar
                ratio={progress}
                label={mode === 'target' ? 'Searching for the best settings…' : undefined}
              />
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 rounded-xl border border-ink-800 bg-ink-950/60 p-4">
              {result.keptOriginal ? (
                <p className="text-sm text-ink-300">
                  This PDF is already well optimised — re-encoding made it larger, so the original
                  file is offered unchanged.
                </p>
              ) : (
                <p className="text-sm text-ink-300">
                  {formatBytes(result.originalSize)} → {formatBytes(result.compressedSize)}{' '}
                  <span className="font-semibold text-mint-400">({savings}% smaller)</span>
                  <span className="ml-2 text-ink-500">
                    at {result.dpi} DPI · quality {Math.round(result.quality * 100)}%
                  </span>
                </p>
              )}
              {!result.reachedTarget ? (
                <p className="mt-2 text-sm text-amber-400">
                  Could not reach {formatBytes(targetBytes)} — this is the smallest result at the
                  lowest quality setting.
                </p>
              ) : null}
              <button
                type="button"
                onClick={() =>
                  downloadBlob(result.blob, `${stripExtension(file.name)}-compressed.pdf`)
                }
                className="btn-primary mt-4"
              >
                Download PDF
              </button>
            </div>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}
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
