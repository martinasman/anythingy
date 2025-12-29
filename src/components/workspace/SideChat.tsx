'use client'

import { useState, useRef, useEffect } from 'react'
import { MODELS } from '@/components/shared/ModelPicker'
import { PromptBox } from '@/components/shared/PromptBox'
import type { SSEEvent, Attachment, ChatMode } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SideChatProps {
  businessId: string
  context: { section: string }
  disabled?: boolean
  events?: SSEEvent[]
  isStreaming?: boolean
  onBusinessUpdate?: () => void
}

const AGENT_LABELS: Record<string, string> = {
  scout: 'Scout',
  strategist: 'Strategist',
  artist: 'Artist',
  architect: 'Architect',
  connector: 'Connector',
}

const SECTION_LABELS: Record<string, string> = {
  overview: 'strategy',
  brand: 'brand',
  website: 'website',
  flow: 'customer journey',
  analytics: 'analytics',
}

function getPlaceholder(mode: ChatMode, section: string, disabled: boolean): string {
  if (disabled) return 'Wait for generation...'

  if (mode === 'chat') {
    return 'Ask about your business...'
  }

  const label = SECTION_LABELS[section] || section
  return `Edit your ${label}...`
}

export function SideChat({ businessId, context, disabled, events = [], isStreaming, onBusinessUpdate }: SideChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-pro')
  const [mode, setMode] = useState<ChatMode>('chat')
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, events])

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || loading || disabled) return

    const userMessage = input.trim()
    const userAttachments = [...attachments]

    setInput('')
    setAttachments([])

    // Build message content including attachments
    let fullMessage = userMessage
    if (userAttachments.length > 0) {
      const attachmentTexts = userAttachments
        .filter(a => a.type === 'text')
        .map(a => `[Attached text]:\n${a.content}`)
      if (attachmentTexts.length > 0) {
        fullMessage = fullMessage + '\n\n' + attachmentTexts.join('\n\n')
      }
    }

    setMessages((prev) => [...prev, { role: 'user', content: userMessage || '[Attachment]' }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          message: fullMessage,
          context: { ...context, mode },
          model: MODELS[selectedModel as keyof typeof MODELS],
          attachments: userAttachments,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const { message, updates } = await response.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: message }])

      // If updates were made in edit mode, trigger a refresh
      if (updates && onBusinessUpdate) {
        onBusinessUpdate()
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {/* Show streaming events */}
        {events.length > 0 && (
          <div className="font-mono text-xs space-y-1 mb-2">
            {events.map((event, i) => {
              const agentLabel = event.agent ? AGENT_LABELS[event.agent] || event.agent : ''

              if (event.type === 'agent_start') {
                return (
                  <div key={i} className="text-foreground font-medium">
                    [{agentLabel}] Starting...
                  </div>
                )
              }

              if (event.type === 'agent_progress') {
                return (
                  <div key={i} className="text-muted-foreground pl-4">
                    {event.message}
                  </div>
                )
              }

              if (event.type === 'agent_complete') {
                return (
                  <div key={i} className="text-primary font-medium">
                    [{agentLabel}] Done
                  </div>
                )
              }

              if (event.type === 'agent_error') {
                return (
                  <div key={i} className="text-destructive">
                    [Error] {event.message}
                  </div>
                )
              }

              if (event.type === 'generation_complete') {
                return (
                  <div key={i} className="text-primary font-medium pt-2 border-t border-border">
                    Generation complete
                  </div>
                )
              }

              return null
            })}
            {isStreaming && (
              <div className="text-muted-foreground flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}


        {/* Chat messages */}
        {messages.map((msg, i) => (
          <div
            key={`msg-${i}`}
            className={`p-2 rounded-lg text-sm ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground ml-6'
                : 'bg-secondary text-foreground mr-6'
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}

        {loading && (
          <div className="bg-secondary p-2 rounded-lg text-sm text-muted-foreground mr-6">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-border border-t-primary rounded-full animate-spin" />
              Thinking...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-1.5 border-t border-border">
        <PromptBox
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          model={selectedModel}
          onModelChange={setSelectedModel}
          placeholder={getPlaceholder(mode, context.section, disabled || false)}
          disabled={disabled || loading}
          loading={loading}
          compact
          attachments={attachments}
          onAttachmentsChange={setAttachments}
          mode={mode}
          onModeChange={setMode}
          showModeToggle
        />
      </div>
    </div>
  )
}
