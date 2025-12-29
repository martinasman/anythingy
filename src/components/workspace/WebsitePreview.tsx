'use client'

import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { generateWebsiteHTML, generateDefaultHTML } from '@/lib/website/generator'
import type { Business } from '@/types'

interface WebsitePreviewProps {
  business: Business
}

export function WebsitePreview({ business }: WebsitePreviewProps) {
  const [code, setCode] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Generate HTML when business data changes
  useEffect(() => {
    if (business.website_structure && business.brand_colors) {
      const html = generateWebsiteHTML(
        business.website_structure,
        business.brand_colors,
        business.business_name || 'My Business'
      )
      setCode(html)
    } else {
      setCode(generateDefaultHTML())
    }
  }, [business.website_structure, business.brand_colors, business.business_name])

  // Update iframe when code changes
  useEffect(() => {
    if (iframeRef.current && code) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(code)
        doc.close()
      }
    }
  }, [code])

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${business.business_name || 'website'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!business.website_structure) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary">
        <div className="text-center max-w-md px-4">
          {business.status === 'pending' || business.status === 'running' ? (
            <>
              <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">
                {business.current_agent === 'architect'
                  ? 'Designing website architecture...'
                  : 'Waiting for website generation...'}
              </p>
              {business.current_agent && (
                <p className="text-xs text-muted-foreground mt-2">
                  Current agent: {business.current_agent}
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
                There was an error generating the website. Please try again.
              </p>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No website structure available</p>
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
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-10 flex items-center justify-between px-4 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#3c3c3c] text-white'
                : 'text-[#8B8B8B] hover:text-white'
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              activeTab === 'code'
                ? 'bg-[#3c3c3c] text-white'
                : 'text-[#8B8B8B] hover:text-white'
            }`}
          >
            Code
          </button>
        </div>
        <button
          onClick={handleDownload}
          className="px-3 py-1 text-xs font-medium text-[#8B8B8B] hover:text-white transition-colors"
        >
          Download HTML
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' ? (
          <div className="h-full bg-white">
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Website Preview"
              sandbox="allow-scripts"
            />
          </div>
        ) : (
          <Editor
            height="100%"
            defaultLanguage="html"
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
    </div>
  )
}
