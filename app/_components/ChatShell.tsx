'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'

interface ChatShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function ChatShell({ title, subtitle, children }: ChatShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 h-full">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
              {title}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">{subtitle}</p>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
