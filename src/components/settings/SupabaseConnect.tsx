'use client'

import { useState, useEffect } from 'react'
import { Database, Link2, Unlink, CheckCircle, AlertCircle, Loader2, ExternalLink, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionStatus {
  connected: boolean
  connection: {
    id: string
    supabase_url: string
    status: 'pending' | 'active' | 'error'
    last_verified_at: string | null
    error_message: string | null
    schema_version: number
    created_at: string
  } | null
}

export function SupabaseConnect() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [serviceRoleKey, setServiceRoleKey] = useState('')

  // Fetch current connection status
  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/supabase/connect')
      const data = await res.json()
      setStatus(data)
    } catch {
      setError('Failed to fetch connection status')
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setConnecting(true)

    try {
      const res = await fetch('/api/supabase/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl,
          anonKey,
          serviceRoleKey: serviceRoleKey || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to connect')
        return
      }

      setSuccess('Connected successfully!')
      setSupabaseUrl('')
      setAnonKey('')
      setServiceRoleKey('')
      fetchStatus()
    } catch {
      setError('Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Supabase project?')) {
      return
    }

    setError(null)
    setSuccess(null)
    setDisconnecting(true)

    try {
      const res = await fetch('/api/supabase/connect', {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to disconnect')
        return
      }

      setSuccess('Disconnected successfully')
      fetchStatus()
    } catch {
      setError('Failed to disconnect')
    } finally {
      setDisconnecting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Database className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Supabase Connection</h2>
          <p className="text-sm text-muted-foreground">
            Connect your own Supabase project to own your data
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-sm text-emerald-500">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}

      {status?.connected ? (
        // Connected State
        <div className="space-y-4">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-emerald-600">Connected</p>
                  <p className="text-xs text-muted-foreground">
                    {status.connection?.supabase_url}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              >
                {disconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4 mr-1" />
                )}
                Disconnect
              </Button>
            </div>

            {status.connection?.last_verified_at && (
              <p className="text-xs text-muted-foreground mt-3">
                Last verified: {new Date(status.connection.last_verified_at).toLocaleString()}
              </p>
            )}
          </div>

          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">What this means:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Your business data is stored in YOUR Supabase project</li>
              <li>You have full access to your data via Supabase dashboard</li>
              <li>You can build your own apps on top of your data</li>
            </ul>
          </div>
        </div>
      ) : (
        // Not Connected State - Show Form
        <div className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Before you connect:</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>
                Create a Supabase project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>Go to Settings &rarr; API in your Supabase dashboard</li>
              <li>Copy your Project URL and API keys below</li>
            </ol>
          </div>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxxx.supabase.co"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Anon Key (public)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Found under &quot;anon public&quot; in API settings
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Service Role Key (optional)
              </label>
              <input
                type="password"
                value={serviceRoleKey}
                onChange={(e) => setServiceRoleKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required for admin operations. Keep this secret!
              </p>
            </div>

            <Button
              type="submit"
              disabled={connecting || !supabaseUrl || !anonKey}
              className="w-full"
            >
              {connecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect Supabase
                </>
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
