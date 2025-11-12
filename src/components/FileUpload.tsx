'use client'

import { useState } from 'react'
import { FileText, Upload, X, Loader2 } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

interface FileUploadProps {
  entryId?: string
  existingFile?: {
    fileName: string
    fileUrl: string
  } | null
  onFileSelect?: (file: File | null) => void
  selectedFile?: File | null
  onDeleteFile?: () => void
  disabled?: boolean
}

export default function FileUpload({ 
  entryId, 
  existingFile, 
  onFileSelect,
  selectedFile,
  onDeleteFile,
  disabled 
}: FileUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const validateAndSelectFile = (file: File) => {
    // Client-side validation
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed')
      return false
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File is too large (max 2MB)')
      return false
    }

    setError(null)
    onFileSelect?.(file)
    return true
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    validateAndSelectFile(file)
    // Reset input
    e.target.value = ''
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      validateAndSelectFile(files[0])
    }
  }

  const handleRemoveSelectedFile = () => {
    onFileSelect?.(null)
    setError(null)
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!entryId) return

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

      onDeleteFile?.()
      setShowDeleteDialog(false)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
    } finally {
      setDeleting(false)
    }
  }

  // Show selected file (not yet uploaded)
  if (selectedFile) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-dark-brown dark:text-dark-text">
          PDF Attachment (optional)
        </label>
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileText className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-dark-brown dark:text-dark-text truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-warm-gray">
                {(selectedFile.size / 1024).toFixed(1)} KB • Will be uploaded on save
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveSelectedFile}
            disabled={disabled}
            className="p-2 text-warm-gray hover:text-red-600 dark:hover:text-red-500 transition-colors disabled:opacity-50 cursor-pointer flex-shrink-0"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  }

  // Show existing file (already uploaded)
  if (existingFile) {
    return (
      <>
        <div className="space-y-3">
          <label className="block text-sm font-medium text-dark-brown dark:text-dark-text">
            PDF Attachment (optional)
          </label>
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
              onClick={handleDeleteClick}
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
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete PDF"
          message="Are you sure you want to delete this PDF? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteDialog(false)}
          isLoading={deleting}
        />
      </>
    )
  }

  // Show upload box
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-dark-brown dark:text-dark-text">
        PDF Attachment (optional)
      </label>
      <label 
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-sm cursor-pointer transition-colors ${
          isDragging 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
            : 'border-warm-gray/30 dark:border-warm-gray/20 hover:border-warm-gray/50 dark:hover:border-warm-gray/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          disabled={disabled}
          className="hidden"
        />
        <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-emerald-600' : 'text-warm-gray'}`} />
        <p className="text-sm text-dark-brown dark:text-dark-text text-center">
          {isDragging ? 'Drop PDF here' : 'Click or drag & drop PDF'}
        </p>
        <p className="text-xs text-warm-gray mt-1">
          Max 2MB
        </p>
      </label>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
