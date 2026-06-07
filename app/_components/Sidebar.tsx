'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Bot, PlusCircle, X, Search } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const nav = [
  { href: '/search', label: 'University Search', icon: Search },
  { href: '/chat', label: 'AI Chat', icon: MessageSquare },
  { href: '/agent', label: 'AI Agent', icon: Bot },
]

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-zinc-900 text-zinc-100 flex flex-col z-30
          transform transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:z-auto lg:flex-shrink-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-800">
          <Link href="/search" className="text-lg font-bold tracking-tight text-white">
            University Education China
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? 'bg-violet-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          <div className="pt-4 border-t border-zinc-800 mt-4">
            <p className="px-3 text-[11px] uppercase tracking-widest text-zinc-500 mb-2">
              History
            </p>
            <p className="px-3 text-xs text-zinc-600 leading-relaxed">
              Your last chat and agent session are saved automatically. Use the&nbsp;
              <span className="text-zinc-400">"New chat"</span> button inside the conversation to start fresh.
            </p>
          </div>
        </nav>

        {/* New conversation shortcut */}
        <div className="px-3 py-4 border-t border-zinc-800">
          <Link
            href={pathname.startsWith('/agent') ? '/agent' : '/chat'}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <PlusCircle size={16} />
            New conversation
          </Link>
        </div>
      </aside>
    </>
  )
}
