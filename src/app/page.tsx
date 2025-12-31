'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MODELS } from '@/components/shared/ModelPicker'
import { PromptBox } from '@/components/shared/PromptBox'
import { GlobalNav } from '@/components/shared/GlobalNav'
import { HomeSidebar } from '@/components/home/HomeSidebar'
import type { User } from '@supabase/supabase-js'

export default function StartPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-pro')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const promptBoxRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setAuthLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const scrollToPrompt = () => {
    promptBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Focus the input after scrolling
    setTimeout(() => {
      const input = promptBoxRef.current?.querySelector('textarea')
      input?.focus()
    }, 300)
  }

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    if (!user) {
      setError('Please log in to create a business')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model: MODELS[selectedModel as keyof typeof MODELS]
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create business')
      }

      const { id } = await response.json()
      router.push(`/workspace/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Global Nav - shown when logged in */}
      {user && <GlobalNav user={user} tier="Free" onSignOut={handleLogout} />}

      {/* Main layout with sidebar */}
      <main className="flex-1 flex">
        {/* Sidebar - only when logged in */}
        {user && <HomeSidebar userId={user.id} onNewClick={scrollToPrompt} />}

        {/* Main content */}
        <div className="flex-1 flex flex-col p-4 md:p-8">
          {/* Header - only show sign in/up when logged out */}
          {!authLoading && !user && (
            <header className="flex justify-end mb-8">
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            </header>
          )}

          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl space-y-8">
              {/* Logo */}
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                  Anything
                </h1>
                <p className="text-muted-foreground mt-2">
                  AI-powered business operating systems
                </p>
              </div>

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center">
                What business should I build for you?
              </h2>

              {/* Input */}
              <div ref={promptBoxRef} className="space-y-4">
                <PromptBox
                  value={prompt}
                  onChange={setPrompt}
                  onSubmit={handleSubmit}
                  model={selectedModel}
                  onModelChange={setSelectedModel}
                  placeholder="Describe your business idea... e.g., 'A yoga studio in Stockholm for busy professionals'"
                  disabled={loading}
                  loading={loading}
                  multiline
                />

                {error && (
                  <p className="text-red-600 text-sm text-center">{error}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
