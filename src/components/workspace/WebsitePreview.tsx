'use client'

import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Download, Loader2 } from 'lucide-react'
import { generatePreviewHTML, getAvailablePages } from '@/lib/website/preview-generator'
import type { Business } from '@/types'

type ViewMode = 'preview' | 'code'
type Viewport = 'desktop' | 'tablet' | 'mobile'

interface WebsitePreviewProps {
  business: Business
  viewMode: ViewMode
  viewport: Viewport
  currentPageSlug: string
}

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

export function WebsitePreview({
  business,
  viewMode,
  viewport,
  currentPageSlug,
}: WebsitePreviewProps) {
  const [html, setHtml] = useState<string>('')

  // Get available pages from website structure
  const pages = getAvailablePages(business)

  // Generate static HTML when business or page changes
  useEffect(() => {
    if (business.status === 'completed' && business.brand_colors) {
      const previewHtml = generatePreviewHTML(business, currentPageSlug)
      setHtml(previewHtml)
    }
  }, [business, currentPageSlug])

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const pageName = pages.find(p => p.slug === currentPageSlug)?.name || 'page'
    const fileName = currentPageSlug === '/'
      ? `${business.business_name?.replace(/\s+/g, '-') || 'website'}.html`
      : `${business.business_name?.replace(/\s+/g, '-') || 'website'}-${pageName.toLowerCase().replace(/\s+/g, '-')}.html`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
    <div className="h-full flex flex-col bg-background relative">
      {/* Download button (floating) */}
      <button
        onClick={handleDownload}
        disabled={!html}
        className="absolute top-3 right-3 z-10 p-2 bg-background border border-border rounded-lg shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
        title="Download HTML"
      >
        <Download className="w-4 h-4" />
      </button>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'preview' ? (
          <div className="h-full flex items-start justify-center bg-muted/20 overflow-auto">
            <div
              className="bg-white overflow-hidden transition-all duration-300"
              style={{
                width: VIEWPORT_WIDTHS[viewport],
                maxWidth: '100%',
                height: '100%',
              }}
            >
              {html ? (
                <iframe
                  srcDoc={html}
                  className="w-full h-full border-0"
                  title="Website Preview"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <div className="text-center max-w-md px-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Generating preview...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Editor
            height="100%"
            defaultLanguage="html"
            value={html}
            onChange={() => {}} // Read-only
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              tabSize: 2,
              automaticLayout: true,
              readOnly: true,
            }}
          />
        )}
      </div>
    </div>
  )
}
