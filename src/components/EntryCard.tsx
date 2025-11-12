'use client'

import Link from 'next/link'
import { Trash2, FileText, Edit2 } from 'lucide-react'
import { Entry } from '@/types'
import { apiDeleteEntry } from '@/lib/api/entries'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

interface EntryCardProps {
  entry: Entry
  onDelete?: () => void
}

export default function EntryCard({ entry, onDelete }: EntryCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

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

  const handleConfirmDelete = async () => {
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

  const handleCancelDelete = () => {
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

        {entry.file && (
          <div className="mt-4 flex items-center gap-2 text-sm text-dark-brown/70 dark:text-dark-text/70">
            <FileText size={16} className="text-emerald-600" />
            <a
              href={entry.file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline cursor-pointer"
            >
              {entry.file.fileName}
            </a>
          </div>
        )}
      </div>

      {showConfirm && (
        <ConfirmDialog
          isOpen={showConfirm}
          title="Delete Entry"
          message="Are you sure you want to delete this entry? This action cannot be undone."
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          cancelLabel="Cancel"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
