'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { UIMessage } from 'ai'

// Converts markdown to clean plain text for document pasting
export function markdownToPlain(md: string): string {
  return md
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')         // # headers → plain text
    .replace(/\*\*(.+?)\*\*/g, '$1')             // **bold**
    .replace(/__(.+?)__/g, '$1')                  // __bold__
    .replace(/\*(.+?)\*/g, '$1')                  // *italic*
    .replace(/_(.+?)_/g, '$1')                    // _italic_
    .replace(/~~(.+?)~~/g, '$1')                  // ~~strike~~
    .replace(/`{3}[\s\S]*?`{3}/g, (m) =>          // ```code blocks``` — keep content
      m.replace(/`{3}[^\n]*\n?/g, '').replace(/`{3}/g, '').trim()
    )
    .replace(/`(.+?)`/g, '$1')                    // `inline code`
    .replace(/^\s*[-*+]\s+/gm, '• ')             // - list → • list
    .replace(/^\s*\d+\.\s+/gm, (m, offset, str) => {// 1. list → 1. (keep numbers)
      void offset; void str; return m
    })
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')           // [link text](url) → link text
    .replace(/^>\s+/gm, '')                        // > blockquote
    .replace(/---+/g, '─────────────────────')    // horizontal rules
    .replace(/\n{3,}/g, '\n\n')                   // collapse extra blank lines
    .trim()
}

type AnyPart = {
  type: string
  text?: string
  toolName?: string
  toolCallId?: string
  state?: string
  input?: unknown
  output?: unknown
}

export function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const parts = message.parts as AnyPart[]

  const textParts = parts.filter((p) => p.type === 'text')
  const toolParts = parts.filter(
    (p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-')
  )

  const fullText = markdownToPlain(textParts.map((p) => p.text ?? '').join('\n'))

  return (
    <div className={`flex w-full gap-3 mb-5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar isUser={isUser} />
      <div className="flex flex-col gap-2 max-w-[85%] sm:max-w-[72%]">
        {textParts.map((part, i) =>
          part.text ? (
            <div
              key={i}
              className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                isUser
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm'
              }`}
            >
              {part.text}
            </div>
          ) : null
        )}

        {/* Copy button for assistant messages */}
        {!isUser && fullText && <CopyButton text={fullText} />}

        {toolParts.map((part, i) => (
          <ToolCard key={part.toolCallId ?? i} part={part} />
        ))}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 self-start text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors px-2 py-1 rounded-lg hover:bg-zinc-800"
    >
      {copied ? (
        <>
          <Check size={12} className="text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy size={12} />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}

function Avatar({ isUser }: { isUser: boolean }) {
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-[10px] font-bold ${
        isUser
          ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
          : 'bg-violet-600 text-white'
      }`}
    >
      {isUser ? 'You' : 'AI'}
    </div>
  )
}

function ToolCard({ part }: { part: AnyPart }) {
  const done = part.state === 'output-available' || part.state === 'output-error'
  const isError = part.state === 'output-error'
  const label = (part.toolName ?? part.type.replace('tool-', '')).replace(/_/g, ' ')

  return (
    <div className="flex items-center gap-2 text-xs text-zinc-500 py-0.5">
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          done
            ? isError
              ? 'bg-red-500'
              : 'bg-emerald-500'
            : 'bg-amber-400 animate-pulse'
        }`}
      />
      <span className="italic">
        {isError ? `Failed: ${label}` : done ? `Used: ${label}` : `Using: ${label}…`}
      </span>
    </div>
  )
}
