'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, X, SlidersHorizontal, MessageSquare, Bot,
  Globe, BookOpen, DollarSign, MapPin, ChevronDown,
  GraduationCap, Zap, ExternalLink, Filter, Users, LogOut,
} from 'lucide-react'
import {
  UNIVERSITIES, PROVINCES, TYPE_LABELS, COST_LABELS,
  DEFAULT_FILTERS, filterUniversities, sortUniversities,
  type UniversityFilters, type SortOrder, type University,
  type UniversityType, type CostLevel,
} from '../_lib/universities'
import type { SessionUser } from '../_lib/auth'

function toggleType(current: UniversityType[], value: UniversityType): UniversityType[] {
  return current.includes(value) ? current.filter((t) => t !== value) : [...current, value]
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function UniversityDashboard({ user }: { user?: SessionUser }) {
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }
  const [filters, setFilters] = useState<UniversityFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<SortOrder>('qs-rank')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const results = useMemo(
    () => sortUniversities(filterUniversities(UNIVERSITIES, filters), sort),
    [filters, sort]
  )

  const activeFilterCount = useMemo(() => {
    let n = 0
    if (filters.province) n++
    if (filters.types.length > 0) n++
    if (filters.ownership !== 'all') n++
    if (filters.cityCostLevel !== 'all') n++
    if (filters.minInternationalStudents > 0) n++
    return n
  }, [filters])

  function setFilter<K extends keyof UniversityFilters>(key: K, value: UniversityFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center gap-3 max-w-screen-xl mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 mr-1">
            <GraduationCap size={22} className="text-violet-400" />
            <span className="font-bold text-base tracking-tight hidden sm:block">University Education China</span>
          </Link>

          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Search university, city, programme…"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilter('search', '')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right nav */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <Filter size={14} />
              {activeFilterCount > 0 && (
                <span className="bg-violet-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <Link
              href="/chat"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <MessageSquare size={14} />
              <span className="hidden md:inline">AI Chat</span>
            </Link>
            <Link
              href="/agent"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-medium text-white transition-colors"
            >
              <Bot size={14} />
              <span className="hidden sm:inline">AI Agent</span>
            </Link>
            {user && (
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-800">
                <span className="text-xs text-zinc-500">{user.username}</span>
                <button
                  onClick={logout}
                  title="Log out"
                  className="text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-screen-xl mx-auto w-full">
        {/* ── Filter Sidebar ──────────────────────────────── */}
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              fixed top-0 left-0 h-full w-72 bg-zinc-900 border-r border-zinc-800 z-40 overflow-y-auto
              transform transition-transform duration-200
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:relative lg:translate-x-0 lg:z-auto lg:w-64 lg:flex-shrink-0 lg:block
            `}
          >
            <div className="p-5 space-y-6">
              {/* Sidebar header */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-violet-400" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-violet-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                      {activeFilterCount}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Reset all
                    </button>
                  )}
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-zinc-500 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Province */}
              <FilterSection title="Province / City">
                <select
                  value={filters.province}
                  onChange={(e) => setFilter('province', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">All provinces</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FilterSection>

              {/* Type */}
              <FilterSection title="University Type">
                <div className="space-y-1.5">
                  {(Object.entries(TYPE_LABELS) as [UniversityType, string][]).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(value)}
                        onChange={() => setFilter('types', toggleType(filters.types, value))}
                        className="accent-violet-500 flex-shrink-0"
                      />
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                  {filters.types.length > 0 && (
                    <button
                      onClick={() => setFilter('types', [])}
                      className="text-xs text-violet-400 hover:text-violet-300 mt-1"
                    >
                      Clear type filter
                    </button>
                  )}
                </div>
              </FilterSection>

              {/* Ownership */}
              <FilterSection title="Public / Private">
                <div className="flex gap-2">
                  {(['all', 'public', 'private'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setFilter('ownership', v)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                        filters.ownership === v
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* City cost level */}
              <FilterSection title="City Cost Level">
                <div className="space-y-1">
                  {([['all', 'Any cost level'], ...Object.entries(COST_LABELS)] as [string, string][]).map(([value, label]) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="cost"
                        value={value}
                        checked={filters.cityCostLevel === value}
                        onChange={() => setFilter('cityCostLevel', value as CostLevel | 'all')}
                        className="accent-violet-500"
                      />
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* International Students filter */}
              <FilterSection title="International Students">
                <div className="space-y-2">
                  {([
                    [0,    'Any'],
                    [500,  '500+'],
                    [1000, '1,000+'],
                    [2000, '2,000+'],
                    [5000, '5,000+'],
                  ] as [number, string][]).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="minIntlStudents"
                        checked={filters.minInternationalStudents === val}
                        onChange={() => setFilter('minInternationalStudents', val)}
                        className="accent-violet-500 flex-shrink-0"
                      />
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          </aside>
        </>

        {/* ── Main Content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 py-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <p className="text-sm text-zinc-400">
              <span className="font-semibold text-white">{results.length}</span>{' '}
              {results.length === 1 ? 'university' : 'universities'}
              {filters.search && ` for "${filters.search}"`}
              {activeFilterCount > 0 && results.length < UNIVERSITIES.length && (
                <span className="ml-1 text-zinc-600">
                  ({UNIVERSITIES.length - results.length} hidden by filters)
                </span>
              )}
            </p>

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500 hidden sm:block">Sort</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOrder)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="qs-rank">QS Ranking</option>
                <option value="national-rank">National Rank</option>
                <option value="name">Name A–Z</option>
                <option value="cost-low">Tuition: Low first</option>
                <option value="cost-high">Tuition: High first</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {results.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {results.map((u) => (
                <UniversityCard key={u.id} university={u} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── Filter Section ────────────────────────────────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2 font-semibold">
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── University Card ───────────────────────────────────────────────────────────

function UniversityCard({ university: u }: { university: University }) {
  const typeColors: Record<string, string> = {
    research: 'bg-violet-500/15 text-violet-400',
    comprehensive: 'bg-blue-500/15 text-blue-400',
    technical: 'bg-amber-500/15 text-amber-400',
    'teacher-training': 'bg-emerald-500/15 text-emerald-400',
    medical: 'bg-red-500/15 text-red-400',
    language: 'bg-pink-500/15 text-pink-400',
    agricultural: 'bg-lime-500/15 text-lime-400',
    vocational: 'bg-zinc-500/15 text-zinc-400',
  }
  const costColor: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
  }

  return (
    <div className="flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-700 transition-colors">
      {/* Card header */}
      <div className="p-5 flex-1 space-y-3">
        {/* Badges row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${typeColors[u.type]}`}>
            {TYPE_LABELS[u.type]}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 capitalize">{u.ownership}</span>
          {u.qsRanking && (
            <span className="ml-auto text-[11px] font-mono text-zinc-500">
              QS #{u.qsRanking}
            </span>
          )}
        </div>

        {/* Name */}
        <div>
          <h2 className="font-semibold text-zinc-100 text-sm leading-snug">{u.name}</h2>
          <p className="text-zinc-500 text-xs mt-0.5">{u.chineseName}</p>
        </div>

        {/* Location + international students */}
        <div className="flex items-center gap-3 flex-wrap">
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin size={11} className="flex-shrink-0" />
            {u.city}, {u.province}
          </p>
          {u.internationalStudents && (
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <Users size={11} className="flex-shrink-0 text-violet-500" />
              <span className="text-violet-400 font-medium">
                ~{u.internationalStudents.toLocaleString()}
              </span>
              <span>intl. students</span>
            </p>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">{u.description}</p>

        {/* Strong programmes */}
        <div className="flex flex-wrap gap-1">
          {u.strongPrograms.slice(0, 3).map((p) => (
            <span key={p} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">
              {p}
            </span>
          ))}
          {u.strongPrograms.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-600">
              +{u.strongPrograms.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Cost strip */}
      <div className="border-t border-zinc-800 px-5 py-3 bg-zinc-900/60 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <DollarSign size={11} />
          <span>
            ${u.tuitionMin.toLocaleString()}–${u.tuitionMax.toLocaleString()}
            <span className="text-zinc-600"> /yr</span>
          </span>
          <span className={`ml-2 font-medium ${costColor[u.cityCostLevel]}`}>
            · {u.cityCostLevel.charAt(0).toUpperCase() + u.cityCostLevel.slice(1)} city cost
          </span>
        </div>
      </div>

      {/* Feature icons */}
      <div className="border-t border-zinc-800 px-5 py-3 flex items-center gap-3 flex-wrap">
        <FeatureIcon show={u.hasEnglishPrograms} label="English programmes" icon="EN" />
        <FeatureIcon show={u.hasCscScholarship} label="CSC scholarship" icon="CSC" />
        <FeatureIcon show={u.hasOnlineApplication} label="Online application" icon="Online" />
        <FeatureIcon show={u.hasInternationalOffice} label="International office" icon="Intl" />

        <a
          href={`https://${u.website}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 transition-colors"
        >
          Website <ExternalLink size={10} />
        </a>
      </div>
    </div>
  )
}

function FeatureIcon({ show, label, icon }: { show: boolean; label: string; icon: string }) {
  if (!show) return null
  return (
    <span
      title={label}
      className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700"
    >
      {icon}
    </span>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
        <GraduationCap size={22} className="text-zinc-600" />
      </div>
      <div>
        <p className="font-medium text-zinc-400">No universities match your filters</p>
        <p className="text-sm text-zinc-600 mt-1">Try widening your search or resetting filters.</p>
      </div>
      <button
        onClick={onReset}
        className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-sm font-medium text-white transition-colors"
      >
        Reset all filters
      </button>
    </div>
  )
}
