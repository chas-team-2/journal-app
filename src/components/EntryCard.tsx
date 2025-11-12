'use client'

import Link from 'next/link'
import { Trash2, FileText, Edit2 } from 'lucide-react'
import { Entry } from '@/types'
import { apiDeleteEntry } from '@/lib/api/entries'
import { useState, useEffect } from 'react'

interface EntryCardProps {
  entry: Entry
  onDelete?: () => void
}

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fileInfo, setFileInfo] = useState<{ fileName: string; fileUrl: string } | null>(null)

  useEffect(() => {
    async function fetchFile() {
      try {
        const response = await fetch(`/api/entries/${entry.id}/file`)
        if (response.ok) {
          const data = await response.json()
          setFileInfo(data.file)
        }
      } catch (error) {
        console.error('Failed to fetch file:', error)
      }
    }

    fetchFile()
  }, [entry.id])

  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(true)
  }

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await apiDeleteEntry(entry.id)
      if (onDelete) {
        onDelete()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowConfirm(false)
  }

  return (
    <>
      <div className="card w-full hover:shadow-lg transition-shadow relative">
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-row justify-between text-xs text-warm-gray mb-2 tracking-wide uppercase">
            {formattedDate}

            <div className='flex items-start -m-4 gap-1'>
              <Link href={`/entries/${entry.id}`} className="cursor-pointer block">
                <button
                  className="p-2 text-dark-brown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-bg rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                  aria-label="Edit entry "
                >
                  <Edit2 size={20} />
                </button>
              </Link>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="p-2 text-dark-brown dark:text-dark-text hover:bg-beige dark:hover:bg-dark-bg rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Delete entry "
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif text-dark-brown dark:text-dark-text mb-2 sm:mb-3">{entry.title}</h2>
        </div>

        <p className="text-dark-brown/80 dark:text-dark-text/80 leading-relaxed whitespace-pre-wrap-break-words">
          {entry.content}
        </p>

        {fileInfo && (
          <div className="mt-4 flex items-center gap-2 text-sm text-dark-brown/70 dark:text-dark-text/70">
            <FileText size={16} className="text-emerald-600" />
            <a
              href={fileInfo.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline cursor-pointer"
            >
              {fileInfo.fileName}
            </a>
          </div>
        )}
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-dark-brown/50 dark:bg-black/70 flex items-center justify-center z-50 px-4 [margin-block-end:0]"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-cream dark:bg-dark-surface rounded-sm p-6 sm:p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-dark-brown dark:text-dark-text mb-4">
              Delete Entry
            </h3>
            <p className="text-dark-brown/80 dark:text-dark-text/80 mb-6">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="btn-secondary cursor-pointer"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-primary cursor-pointer"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
