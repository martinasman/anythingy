'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'promo-banner-dismissed'

interface PromoBannerProps {
  onSubscribe?: () => void
}

export function PromoBanner({ onSubscribe }: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(true) // Start hidden to prevent flash

  useEffect(() => {
    const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true'
    setDismissed(isDismissed)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 flex items-center justify-center gap-4 shrink-0">
      <span className="text-sm font-medium">
        Unlock exclusive features by subscribing today!
      </span>
      <button
        onClick={onSubscribe}
        className="px-3 py-1 text-sm font-medium bg-white text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
      >
        Subscribe Now
      </button>
      <button
        onClick={handleDismiss}
        className="absolute right-4 p-1 hover:bg-white/10 rounded transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
