'use client'

import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Entry } from '@/types'
import { apiDeleteEntry } from '@/lib/api/entries'
import { useState } from 'react'

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
      <Link href={`/entries/${entry.id}`} className="cursor-pointer block">
        <div className="card w-full hover:shadow-lg transition-shadow relative">
          <div className="mb-3 sm:mb-4">
            <div className="text-xs text-warm-gray mb-2 tracking-wide uppercase">
              {formattedDate}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-dark-brown mb-2 sm:mb-3">{entry.title}</h2>
          </div>

          <p className="text-dark-brown/80 leading-relaxed whitespace-pre-wrap-break-words">
            {entry.content}
          </p>

          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-2 text-dark-brown hover:bg-beige rounded-sm transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Delete entry "
          >
            <Trash2 size={20} />
          </button>
        </div>
      </Link>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-dark-brown/50 flex items-center justify-center z-50 px-4 [margin-block-end:0]"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-cream rounded-sm p-6 sm:p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-dark-brown mb-4">
              Delete Entry
            </h3>
            <p className="text-dark-brown/80 mb-6">
              Are you sure you want to delete this entry? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                className="btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="btn-primary"
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
