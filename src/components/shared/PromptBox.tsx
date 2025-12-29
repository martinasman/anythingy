'use client'

import { useRef } from 'react'
import { ModelPicker } from './ModelPicker'
import type { Attachment, ChatMode } from '@/types'

interface PromptBoxProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  model: string
  onModelChange: (model: string) => void
  placeholder?: string
  disabled?: boolean
  loading?: boolean
  multiline?: boolean
  compact?: boolean
  // Attachments
  attachments?: Attachment[]
  onAttachmentsChange?: (attachments: Attachment[]) => void
  // Mode toggle
  mode?: ChatMode
  onModeChange?: (mode: ChatMode) => void
  showModeToggle?: boolean
}

export function PromptBox({
  value,
  onChange,
  onSubmit,
  model,
  onModelChange,
  placeholder = 'Type a message...',
  disabled = false,
  loading = false,
  multiline = false,
  compact = false,
  attachments = [],
  onAttachmentsChange,
  mode = 'chat',
  onModeChange,
  showModeToggle = false,
}: PromptBoxProps) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (multiline) {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onSubmit()
      }
    } else {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSubmit()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    if (!onAttachmentsChange) return

    const items = e.clipboardData.items

    for (let i = 0; i < items.length; i++) {
      const item = items[i]

      // Handle images
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const content = event.target?.result as string
            onAttachmentsChange([
              ...attachments,
              {
                id: crypto.randomUUID(),
                type: 'image',
                content,
                preview: file.name || 'Pasted image',
              },
            ])
          }
          reader.readAsDataURL(file)
        }
        return
      }

      // Handle text (only if it's substantial)
      if (item.type === 'text/plain') {
        item.getAsString((text) => {
          // Only create attachment for multi-line or long text
          if (text.includes('\n') || text.length > 200) {
            e.preventDefault()
            onAttachmentsChange([
              ...attachments,
              {
                id: crypto.randomUUID(),
                type: 'text',
                content: text,
                preview: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
              },
            ])
          }
        })
      }
    }
  }

  const removeAttachment = (id: string) => {
    if (onAttachmentsChange) {
      onAttachmentsChange(attachments.filter((a) => a.id !== id))
    }
  }

  const isDisabled = disabled || loading
  const hasAttachments = attachments.length > 0

  return (
    <div className="relative bg-white border border-border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all">
      {/* Attachments */}
      {hasAttachments && (
        <div className="px-3 pt-2 flex flex-wrap gap-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative w-10 h-10 bg-secondary rounded-md text-xs text-foreground flex flex-col items-center justify-center overflow-hidden group"
            >
              {attachment.type === 'image' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              )}
              <button
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-foreground/80 text-background rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={multiline ? 4 : 1}
        className={`w-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none disabled:opacity-50 ${
          multiline
            ? `px-4 text-base ${hasAttachments ? 'pt-2 pb-14' : 'pt-4 pb-14'}`
            : compact
              ? `px-3 text-sm ${hasAttachments ? 'pt-1 pb-9' : 'pt-2 pb-9'}`
              : `px-4 text-sm ${hasAttachments ? 'pt-2 pb-12' : 'pt-3 pb-12'}`
        }`}
        style={{ minHeight: multiline ? undefined : compact ? '60px' : '80px' }}
      />

      {/* Bottom controls */}
      <div
        className={`absolute flex items-center justify-between ${
          compact ? 'bottom-1.5 left-2 right-2' : 'bottom-3 left-3 right-3'
        }`}
      >
        <div className="flex items-center gap-1.5">
          {/* Mode toggle */}
          {showModeToggle && onModeChange && (
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as ChatMode)}
              disabled={isDisabled}
              className={`bg-secondary border border-border rounded-full text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:bg-accent transition-all disabled:opacity-50 cursor-pointer appearance-none ${
                compact ? 'px-2 py-0.5 text-[10px] pr-5' : 'px-3 py-1.5 text-xs pr-6'
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${compact ? '10' : '12'}' height='${compact ? '10' : '12'}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: compact ? 'right 6px center' : 'right 8px center',
              }}
            >
              <option value="chat">Chat</option>
              <option value="edit">Edit</option>
            </select>
          )}

          <ModelPicker
            value={model}
            onChange={onModelChange}
            disabled={isDisabled}
            variant="pill"
            size={compact ? 'sm' : 'default'}
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={isDisabled || (!value.trim() && attachments.length === 0)}
          className={`bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center ${
            compact ? 'w-6 h-6' : 'px-4 py-1.5 text-sm gap-1.5'
          }`}
        >
          {loading ? (
            <span
              className={`border-2 border-white/30 border-t-white rounded-full animate-spin ${
                compact ? 'w-3 h-3' : 'w-3.5 h-3.5'
              }`}
            />
          ) : compact ? (
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          ) : (
            <>
              Go
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
