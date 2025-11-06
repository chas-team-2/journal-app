'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiGetEntries } from '@/lib/api/entries'
import { apiGetCurrentUser } from '@/lib/api/auth'
import { Entry } from '@/types'
import Header from '@/components/Header'
import EntryCard from '@/components/EntryCard'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const user = await apiGetCurrentUser()

        if (!user) {
          router.push('/login')
          return
        }

        const data = await apiGetEntries()
        setEntries(data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load entries';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-warm-gray text-center">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 sm:mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif text-dark-brown mb-1 sm:mb-2">
  Your Entries
</h2>
            <p className="text-warm-gray text-sm">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
          <Link href="/new-entry" className="self-stretch sm:self-auto">
  <button className="btn-primary w-full sm:w-auto sm:min-w-160px">
    New Entry
  </button>
</Link>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-2">
            <p className="text-warm-gray mb-6">{"You haven't written any entries yet."}</p>
            <Link href="/new-entry">
              <button className="btn-secondary">Write your first entry</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
