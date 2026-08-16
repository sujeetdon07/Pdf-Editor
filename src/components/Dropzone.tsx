import { useRef, useState, type DragEvent } from 'react'

interface DropzoneProps {
  accept: string
  multiple?: boolean
  label: string
  hint: string
  onFiles: (files: File[]) => void
}

export default function Dropzone({ accept, multiple, label, hint, onFiles }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) onFiles(multiple ? files : files.slice(0, 1))
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`rounded-2xl border border-dashed p-10 text-center transition ${
        isDragging ? 'border-moss-400 bg-moss-400/10' : 'border-paper-400 bg-white/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length > 0) onFiles(files)
          event.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="btn-primary"
      >
        {label}
      </button>
      <p className="mt-3 text-sm text-ink-500">{hint}</p>
    </div>
  )
}
