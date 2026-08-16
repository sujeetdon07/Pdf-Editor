export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

export function stripExtension(name: string): string {
  return name.replace(/\.[^./\\]+$/, '')
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/**
 * Turns a thrown value into something a reader can act on. pdf-lib and PDF.js
 * raise accurate but cryptic messages, so the common ones are rewritten and
 * anything unrecognised falls back to the caller's wording.
 */
export function describeFailure(cause: unknown, fallback: string): string {
  const message = cause instanceof Error ? cause.message : ''
  if (/encrypt|password/i.test(message)) {
    return 'This file is password-protected. Remove the password and try again.'
  }
  if (/invalid pdf|no pdf header|failed to parse|structure|corrupt/i.test(message)) {
    return 'This file is not a readable PDF — it may be corrupt or only partly downloaded.'
  }
  if (/out of memory|allocation/i.test(message)) {
    return 'Your browser ran out of memory on this file. Try a smaller document or fewer pages.'
  }
  return message || fallback
}

export function readAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer()
}
