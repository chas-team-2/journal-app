'use client'

import { useState } from 'react'
import { FileText, Upload, X, Loader2 } from 'lucide-react'

interface FileUploadProps {
  entryId: string
  existingFile?: {
    fileName: string
    fileUrl: string
  } | null
  onUploadComplete?: () => void
  disabled?: boolean
}

export default function FileUpload({ entryId, existingFile, onUploadComplete, disabled }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File is too large (max 2MB)')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('entryId', entryId)

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Upload failed')
      }

      onUploadComplete?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this PDF?')) return

    setDeleting(true)
    setError(null)

    try {
      const response = await fetch(`/api/files?entryId=${entryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      onUploadComplete?.()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-dark-brown dark:text-dark-text">
        PDF Attachment (optional)
      </label>

      {existingFile ? (
        <div className="flex items-center justify-between p-3 bg-beige/50 dark:bg-dark-surface/50 rounded-sm border border-warm-gray/20">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-dark-brown dark:text-dark-text truncate">
                {existingFile.fileName}
              </p>
              <a
                href={existingFile.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-warm-gray hover:text-dark-brown dark:hover:text-beige cursor-pointer"
              >
                View file
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || disabled}
            className="p-2 text-warm-gray hover:text-red-600 dark:hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
            title="Delete PDF"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-warm-gray/30 dark:border-warm-gray/20 rounded-sm cursor-pointer hover:border-warm-gray/50 dark:hover:border-warm-gray/40 transition-colors">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            disabled={uploading || disabled}
            className="hidden"
          />
          {uploading ? (
            <Loader2 className="w-8 h-8 text-warm-gray animate-spin mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-warm-gray mb-2" />
          )}
          <p className="text-sm text-dark-brown dark:text-dark-text">
            {uploading ? 'Uploading...' : 'Click to upload PDF'}
          </p>
          <p className="text-xs text-warm-gray mt-1">
            Max 2MB
          </p>
        </label>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
