import Link from 'next/link'
import { Entry } from '@/types'

interface EntryCardProps {
  entry: Entry
}

export default function EntryCard({ entry }: EntryCardProps) {
  const formattedDate = new Date(entry.created_at).toLocaleDateString("en-GB", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
    minute: "2-digit",
    hour12: false,
	});

  return (

      <div className="card w-full cursor-pointer hover:shadow-lg transition-shadow">
        <Link href={`/entries/${entry.id}`}>
          <div className="mb-3 sm:mb-4">
            <div className="text-xs text-warm-gray mb-2 tracking-wide uppercase">
              {formattedDate}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-dark-brown mb-2 sm:mb-3">{entry.title}</h2>
            </div>
            <p className="text-dark-brown/80 leading-relaxed whitespace-pre-wrap-break-words">
              {entry.content}
            </p>
        </Link>
      </div>
        
  )
}
