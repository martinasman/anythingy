'use client'

import { useState, useEffect, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Download,
  Terminal,
  ChevronDown,
  Code,
  Eye,
  Loader2,
} from 'lucide-react'
import { useWebContainer } from '@/hooks/useWebContainer'
import { generateViteProject, generateDefaultApp } from '@/lib/website/vite-template'
import type { Business } from '@/types'

interface WebsitePreviewProps {
  business: Business
}

type Viewport = 'desktop' | 'tablet' | 'mobile'
type ActiveTab = 'preview' | 'code'

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function WebsitePreview({ business }: WebsitePreviewProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('preview')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [showTerminal, setShowTerminal] = useState(false)
  const [code, setCode] = useState<string>('')
  const [hasInitialized, setHasInitialized] = useState(false)

  const {
    status,
    previewUrl,
    terminalOutput,
    error,
    mountFiles,
    writeFile,
    restart,
  } = useWebContainer()

  // Generate React code from business data
  const generateCode = useCallback(() => {
    // For now, use the website_code field if available, otherwise generate default
    if (business.website_code) {
      return business.website_code
    }
    return generateDefaultApp(
      business.business_name || 'My Business',
      business.tagline || undefined
    )
  }, [business.website_code, business.business_name, business.tagline])

  // Initialize WebContainer when component mounts with complete data
  useEffect(() => {
    if (hasInitialized) return
    if (!business.brand_colors) return
    if (business.status !== 'completed') return

    const componentCode = generateCode()
    setCode(componentCode)

    const files = generateViteProject({
      businessName: business.business_name || 'My Business',
      tagline: business.tagline || undefined,
      brandColors: business.brand_colors,
      offerings: [], // TODO: Fetch offerings from DB
      componentCode,
    })

    mountFiles(files)
    setHasInitialized(true)
  }, [business, hasInitialized, mountFiles, generateCode])

  // Update files when code changes in editor
  const handleCodeChange = useCallback(
    async (value: string | undefined) => {
      if (!value || !business.brand_colors) return
      setCode(value)

      // Write just the App.jsx file for hot reload - Vite will handle the rest
      await writeFile('/src/App.jsx', value)
    },
    [business.brand_colors, writeFile]
  )

  const handleDownload = () => {
    // Create a zip file with the project
    // For now, just download the React code
    const blob = new Blob([code], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'App.jsx'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleOpenInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  // Loading/waiting state
  if (!business.brand_colors || business.status !== 'completed') {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center max-w-md px-4">
          {business.status === 'pending' || business.status === 'running' ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">
                {business.current_agent === 'architect'
                  ? 'Designing your website...'
                  : 'Generating your business...'}
              </p>
              {business.current_agent && (
                <p className="text-xs text-muted-foreground mt-2">
                  Current: {business.current_agent}
                </p>
              )}
            </>
          ) : business.status === 'failed' ? (
            <>
              <div className="w-12 h-12 mx-auto mb-4 text-destructive">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-destructive font-medium">Generation failed</p>
              <p className="text-sm text-muted-foreground mt-2">
                There was an error. Please try again.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No website data available</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a new generation to create your website.
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Toolbar */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-border bg-muted/30">
        {/* Left: View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-background rounded-lg p-1 border border-border">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'preview'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'code'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Code
            </button>
          </div>

          {/* Viewport Toggle (only in preview mode) */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 ml-4">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-2 rounded transition-colors ${
                  viewport === 'desktop'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-2 rounded transition-colors ${
                  viewport === 'tablet'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-2 rounded transition-colors ${
                  viewport === 'mobile'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Center: Status */}
        <div className="flex items-center gap-2">
          {status !== 'ready' && status !== 'idle' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="capitalize">{status}...</span>
            </div>
          )}
          {error && (
            <span className="text-xs text-destructive">{error}</span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTerminal(!showTerminal)}
            className={`p-2 rounded transition-colors ${
              showTerminal
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            title="Toggle Terminal"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={restart}
            disabled={status !== 'ready' && status !== 'error'}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
            title="Restart Server"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenInNewTab}
            disabled={!previewUrl}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-50"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview/Code Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'preview' ? (
            <div className="h-full flex items-start justify-center bg-muted/20 p-4 overflow-auto">
              <div
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
                style={{
                  width: VIEWPORT_WIDTHS[viewport],
                  maxWidth: '100%',
                  height: viewport === 'desktop' ? '100%' : 'calc(100% - 32px)',
                }}
              >
                {status === 'ready' && previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    title="Website Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                      <p className="text-sm text-muted-foreground">
                        {status === 'booting' && 'Starting WebContainer...'}
                        {status === 'mounting' && 'Loading project files...'}
                        {status === 'installing' && 'Installing dependencies...'}
                        {status === 'starting' && 'Starting dev server...'}
                        {status === 'idle' && 'Initializing...'}
                        {status === 'error' && 'Error occurred'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 2,
                automaticLayout: true,
              }}
            />
          )}
        </div>

        {/* Terminal Panel */}
        {showTerminal && (
          <div className="border-t border-border bg-[#1e1e1e]">
            <div
              className="flex items-center justify-between px-4 py-2 bg-[#252526] cursor-pointer"
              onClick={() => setShowTerminal(!showTerminal)}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#8B8B8B]" />
                <span className="text-xs text-[#8B8B8B] font-medium">Terminal</span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8B8B8B]" />
            </div>
            <div className="h-40 overflow-auto p-3 font-mono text-xs">
              {terminalOutput.map((line, i) => (
                <div key={i} className="text-[#8B8B8B] whitespace-pre-wrap">
                  {line}
                </div>
              ))}
              {terminalOutput.length === 0 && (
                <div className="text-[#5A5A5A]">Terminal output will appear here...</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
