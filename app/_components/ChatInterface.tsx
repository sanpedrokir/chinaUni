'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef, useState, useMemo } from 'react'
import { Send, Loader2, AlertCircle, RotateCcw, Copy, Check, Bot, MessageSquare } from 'lucide-react'
import { MessageBubble, markdownToPlain } from './MessageBubble'

// ─── DB row → UIMessage conversion ────────────────────────────────────────────

type DbRow = { id: string; role: string; content: string }

function rowToUIMessage(row: DbRow): UIMessage {
  return {
    id: row.id,
    role: row.role as 'user' | 'assistant',
    parts: [{ type: 'text', text: row.content ?? '' }],
    metadata: {},
  } as UIMessage
}

// ─── Public component ──────────────────────────────────────────────────────────

interface ChatInterfaceProps {
  api: string
  mode: 'chat' | 'agent'
  placeholder?: string
  emptyHeading?: string
  emptyBody?: string
  suggestions?: string[]
}

export function ChatInterface({
  api,
  mode,
  placeholder = 'Message AI…',
  emptyHeading = 'How can I help?',
  emptyBody = 'Ask me anything.',
  suggestions,
}: ChatInterfaceProps) {
  const storageKey = `chinauni_conv_${mode}`
  const [convId, setConvId] = useState<string | null>(null)
  const [preloaded, setPreloaded] = useState<UIMessage[] | null>(null)

  useEffect(() => {
    async function init() {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        try {
          const res = await fetch(`/api/conversations/${saved}/messages`)
          if (res.ok) {
            const rows: DbRow[] = await res.json()
            setConvId(saved)
            setPreloaded(rows.map(rowToUIMessage))
            return
          }
        } catch {
          // fall through to create a new conversation
        }
      }

      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      const { id } = await res.json()
      localStorage.setItem(storageKey, id)
      setConvId(id)
      setPreloaded([])
    }

    init()
  }, [mode, storageKey])

  if (!convId || !preloaded) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        <Loader2 size={20} className="animate-spin" />
      </div>
    )
  }

  return (
    <ChatInner
      api={api}
      mode={mode}
      convId={convId}
      storageKey={storageKey}
      preloaded={preloaded}
      placeholder={placeholder}
      emptyHeading={emptyHeading}
      emptyBody={emptyBody}
      suggestions={suggestions}
    />
  )
}

// ─── Inner chat ────────────────────────────────────────────────────────────────

function ChatInner({
  api,
  mode,
  convId,
  storageKey,
  preloaded,
  placeholder,
  emptyHeading,
  emptyBody,
  suggestions,
}: {
  api: string
  mode: 'chat' | 'agent'
  convId: string
  storageKey: string
  preloaded: UIMessage[]
  placeholder: string
  emptyHeading: string
  emptyBody: string
  suggestions?: string[]
}) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api, body: { conversationId: convId } }),
    [api, convId]
  )

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: preloaded,
  })

  const [input, setInput] = useState('')
  const [convCopied, setConvCopied] = useState(false)
  const isLoading = status === 'submitted' || status === 'streaming'

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  function submit(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || isLoading) return
    sendMessage({ text: msg })
    setInput('')
    setTimeout(() => {
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }, 0)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  async function newChat() {
    localStorage.removeItem(storageKey)
    window.location.reload()
  }

  async function copyConversation() {
    const lines: string[] = []
    for (const msg of messages) {
      const parts = msg.parts as Array<{ type: string; text?: string }>
      const text = parts
        .filter((p) => p.type === 'text')
        .map((p) => p.text ?? '')
        .join('\n')
      if (!text.trim()) continue
      const speaker = msg.role === 'user' ? 'You' : 'AI'
      lines.push(`${speaker}:\n${markdownToPlain(text)}`)
    }
    await navigator.clipboard.writeText(lines.join('\n\n'))
    setConvCopied(true)
    setTimeout(() => setConvCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Actions bar — visible only when there are messages */}
      {messages.length > 0 && (
        <div className="flex items-center justify-end gap-3 px-4 pt-3 pb-2 flex-shrink-0 border-b border-zinc-800">
          <button
            onClick={copyConversation}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {convCopied ? (
              <>
                <Check size={12} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy conversation
              </>
            )}
          </button>
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <RotateCcw size={12} />
            New chat
          </button>
        </div>
      )}

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 ? (
            <EmptyState
              mode={mode}
              heading={emptyHeading}
              body={emptyBody}
              suggestions={suggestions}
              onSuggest={(s) => submit(s)}
              isLoading={isLoading}
            />
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
              <Loader2 size={14} className="animate-spin" />
              <span>Thinking…</span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 px-4 py-3 text-red-600 dark:text-red-400 text-sm mb-4">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error.message}</span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Persistent suggestion chips — only shown when there are messages */}
      {messages.length > 0 && suggestions && suggestions.length > 0 && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 pt-2.5 pb-1 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Suggested questions</p>
            <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  disabled={isLoading}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 text-xs text-zinc-400 hover:border-violet-500 hover:bg-violet-950/40 hover:text-violet-300 transition-colors disabled:opacity-40 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 flex-shrink-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              autoResize()
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 overflow-y-auto leading-relaxed"
          />
          <button
            type="button"
            onClick={() => submit()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isLoading ? (
              <Loader2 size={16} className="text-white animate-spin" />
            ) : (
              <Send size={16} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-center text-[11px] text-zinc-400 mt-2 max-w-3xl mx-auto">
          Enter to send · Shift+Enter for new line · History saved across sessions
        </p>
      </div>
    </div>
  )
}

// ─── Empty state with icon + suggestion chips ──────────────────────────────────

function EmptyState({
  mode,
  heading,
  body,
  suggestions,
  onSuggest,
  isLoading,
}: {
  mode: 'chat' | 'agent'
  heading: string
  body: string
  suggestions?: string[]
  onSuggest: (text: string) => void
  isLoading: boolean
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center gap-6 px-2">
      {/* Icon */}
      {mode === 'agent' ? (
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Bot size={40} className="text-white" />
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-violet-500/40 animate-ping" />
        </div>
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <MessageSquare size={28} className="text-violet-400" />
        </div>
      )}

      {/* Text */}
      <div>
        <h2 className="text-2xl font-semibold text-zinc-100">{heading}</h2>
        <p className="text-zinc-500 text-sm max-w-sm mt-1.5 leading-relaxed">{body}</p>
      </div>

      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-xl">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => onSuggest(s)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 text-sm text-zinc-300 hover:border-violet-500 hover:bg-violet-950/40 hover:text-violet-200 transition-colors text-left disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
