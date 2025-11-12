'use client'

import { apiSignOut } from '@/lib/api/auth'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    try {
      await apiSignOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isEditOrNewPage = pathname?.startsWith('/entries/') || pathname === '/new-entry'

  return (
    <header className="border-b border-warm-gray/20 bg-white dark:bg-dark-surface dark:border-warm-gray/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-3">
        {isEditOrNewPage ? (
          <Link href="/dashboard" className="text-xl sm:text-2xl font-serif text-dark-brown dark:text-dark-text hover:opacity-70 transition-opacity cursor-pointer">
            Journal
          </Link>
        ) : (
          <h1 className="text-xl sm:text-2xl font-serif text-dark-brown dark:text-dark-text">Journal</h1>
        )}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="text-sm text-warm-gray hover:text-dark-brown dark:hover:text-dark-text cursor-pointer transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
