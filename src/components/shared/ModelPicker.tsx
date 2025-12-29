'use client'

export const MODELS = {
  // Google (Gemini) - default
  'gemini-3-pro': 'google/gemini-3-pro-preview',
  'gemini-3-flash': 'google/gemini-3-flash-preview',
  'gemini-3-pro-image': 'google/gemini-3-pro-image-preview',

  // Anthropic
  'claude-sonnet': 'anthropic/claude-sonnet-4.5',
  'claude-opus': 'anthropic/claude-opus-4.5',
  'claude-haiku': 'anthropic/claude-haiku-4.5',

  // OpenAI
  'gpt-4-turbo': 'openai/gpt-4-turbo',
  'gpt-4': 'openai/gpt-4',
  'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',

  // DeepSeek
  'deepseek-chat': 'deepseek/deepseek-chat',
  'deepseek-coder': 'deepseek/deepseek-coder',

  // Grok
  'grok-4.1': 'x-ai/grok-4.1-fast',
}

export const MODEL_LABELS: Record<string, string> = {
  'gemini-3-pro': 'Gemini 3 Pro',
  'gemini-3-flash': 'Gemini 3 Flash',
  'gemini-3-pro-image': 'Gemini 3 Pro Image',
  'claude-sonnet': 'Claude Sonnet',
  'claude-opus': 'Claude Opus',
  'claude-haiku': 'Claude Haiku',
  'gpt-4-turbo': 'GPT-4 Turbo',
  'gpt-4': 'GPT-4',
  'gpt-3.5-turbo': 'GPT-3.5',
  'deepseek-chat': 'DeepSeek Chat',
  'deepseek-coder': 'DeepSeek Coder',
  'grok-4.1': 'Grok 4.1',
}

interface ModelPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
  variant?: 'default' | 'pill'
  size?: 'default' | 'sm'
}

export function ModelPicker({
  value,
  onChange,
  disabled,
  className = '',
  variant = 'default',
  size = 'default',
}: ModelPickerProps) {
  if (variant === 'pill') {
    const sizeClasses = size === 'sm'
      ? 'px-2 py-0.5 text-[10px] pr-5'
      : 'px-3 py-1.5 text-xs pr-6'

    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${sizeClasses} bg-secondary border border-border rounded-full text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:bg-accent transition-all disabled:opacity-50 cursor-pointer appearance-none ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size === 'sm' ? '10' : '12'}' height='${size === 'sm' ? '10' : '12'}' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: size === 'sm' ? 'right 6px center' : 'right 8px center',
        }}
      >
        <optgroup label="Google (Gemini)">
          <option value="gemini-3-pro">Gemini 3 Pro</option>
          <option value="gemini-3-flash">Gemini 3 Flash</option>
          <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
        </optgroup>
        <optgroup label="Anthropic (Claude)">
          <option value="claude-sonnet">Claude Sonnet</option>
          <option value="claude-opus">Claude Opus</option>
          <option value="claude-haiku">Claude Haiku</option>
        </optgroup>
        <optgroup label="OpenAI">
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5</option>
        </optgroup>
        <optgroup label="DeepSeek">
          <option value="deepseek-chat">DeepSeek Chat</option>
          <option value="deepseek-coder">DeepSeek Coder</option>
        </optgroup>
        <optgroup label="Grok (xAI)">
          <option value="grok-4.1">Grok 4.1</option>
        </optgroup>
      </select>
    )
  }

  return (
    <div className={className}>
      <label className="text-xs font-semibold text-foreground block mb-2">
        AI Model
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-muted-foreground/50 transition-all disabled:opacity-50"
      >
        <optgroup label="Google (Gemini)" className="text-[#4A3F35]">
          <option value="gemini-3-pro">Gemini 3 Pro</option>
          <option value="gemini-3-flash">Gemini 3 Flash</option>
          <option value="gemini-3-pro-image">Gemini 3 Pro Image</option>
        </optgroup>

        <optgroup label="Anthropic (Claude)" className="text-[#4A3F35]">
          <option value="claude-sonnet">Claude Sonnet 4.5</option>
          <option value="claude-opus">Claude Opus 4.5</option>
          <option value="claude-haiku">Claude Haiku 4.5</option>
        </optgroup>

        <optgroup label="OpenAI" className="text-[#4A3F35]">
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </optgroup>

        <optgroup label="DeepSeek" className="text-[#4A3F35]">
          <option value="deepseek-chat">DeepSeek Chat</option>
          <option value="deepseek-coder">DeepSeek Coder</option>
        </optgroup>

        <optgroup label="Grok (xAI)" className="text-[#4A3F35]">
          <option value="grok-4.1">Grok 4.1 Fast</option>
        </optgroup>
      </select>
    </div>
  )
}
