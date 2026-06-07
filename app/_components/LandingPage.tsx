'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertCircle, CheckCircle2, Loader2, GraduationCap } from 'lucide-react'

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Australia',
  'Austria', 'Azerbaijan', 'Bangladesh', 'Belgium', 'Bolivia', 'Brazil',
  'Cambodia', 'Cameroon', 'Canada', 'Chile', 'Colombia', 'Congo', 'Cuba',
  'Denmark', 'Ecuador', 'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany',
  'Ghana', 'Greece', 'Guatemala', 'Hungary', 'India', 'Indonesia', 'Iran',
  'Iraq', 'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'South Korea', 'Kuwait', 'Laos', 'Lebanon', 'Liberia', 'Libya', 'Malaysia',
  'Mali', 'Mexico', 'Mongolia', 'Morocco', 'Mozambique', 'Myanmar', 'Nepal',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
  'Palestine', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
  'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal', 'Sierra Leone', 'Singapore',
  'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden',
  'Switzerland', 'Syria', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
  'Other',
]

type EnquiryState = { name: string; email: string; contact: string; country: string; message: string }
type FormStatus = 'idle' | 'loading' | 'success' | 'error'

export function LandingPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const authRequired = searchParams.get('auth') === 'required'

  const [enquiry, setEnquiry] = useState<EnquiryState>({
    name: '', email: '', contact: '', country: '', message: '',
  })
  const [enquiryStatus, setEnquiryStatus] = useState<FormStatus>('idle')
  const [enquiryError, setEnquiryError] = useState('')

  const [showLogin, setShowLogin] = useState(authRequired)
  const [creds, setCreds] = useState({ username: '', password: '' })
  const [loginStatus, setLoginStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [loginError, setLoginError] = useState('')

  async function submitEnquiry(e: React.FormEvent) {
    e.preventDefault()
    setEnquiryStatus('loading')
    setEnquiryError('')
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: enquiry.name,
          email: enquiry.email,
          contactNumber: enquiry.contact,
          country: enquiry.country,
          message: enquiry.message,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setEnquiryError(data.error ?? 'Something went wrong. Please try again.')
        setEnquiryStatus('error')
      } else {
        setEnquiryStatus('success')
        setEnquiry({ name: '', email: '', contact: '', country: '', message: '' })
      }
    } catch {
      setEnquiryError('Network error. Please try again.')
      setEnquiryStatus('error')
    }
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginStatus('loading')
    setLoginError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      })
      if (!res.ok) {
        const data = await res.json()
        setLoginError(data.error ?? 'Invalid credentials.')
        setLoginStatus('error')
      } else {
        router.push('/search')
      }
    } catch {
      setLoginError('Network error. Please try again.')
      setLoginStatus('error')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition'

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div className="text-center">
            <span className="text-lg font-bold tracking-tight text-zinc-900">University Education China</span>
            <span className="hidden sm:inline text-zinc-500 text-sm ml-3">
              Study in China — University Consultation
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        {/* Auth required notice */}
        {authRequired && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-700 text-sm mb-8">
            <AlertCircle size={16} className="flex-shrink-0" />
            Please log in to access the university search and AI tools.
          </div>
        )}

        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-3 leading-tight">
            Expert guidance for international students navigating admissions, scholarships, and campus life at Chinese universities.
          </h1>
          <p className="text-sm font-medium text-violet-600 tracking-widest uppercase">
            University Education China · Helping international students study in China
          </p>
        </div>

        {/* Enquiry form */}
        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">Request For Consultation</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Tell us about yourself and we&apos;ll reach out within 24 hours.
          </p>

          {enquiryStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-zinc-900 font-semibold text-lg">Enquiry Submitted!</p>
                <p className="text-zinc-500 text-sm mt-1 max-w-xs leading-relaxed">
                  Our team has been notified and will contact you soon.
                </p>
              </div>
              <button
                onClick={() => setEnquiryStatus('idle')}
                className="text-sm text-violet-600 hover:text-violet-700 transition-colors underline underline-offset-2"
              >
                Submit another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submitEnquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={enquiry.name}
                  onChange={(e) => setEnquiry((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={enquiry.email}
                  onChange={(e) => setEnquiry((p) => ({ ...p, email: e.target.value }))}
                  placeholder="you@example.com"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={enquiry.contact}
                  onChange={(e) => setEnquiry((p) => ({ ...p, contact: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={enquiry.country}
                  onChange={(e) => setEnquiry((p) => ({ ...p, country: e.target.value }))}
                  required
                  className={`${inputClass} appearance-none`}
                >
                  <option value="">Select your country…</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1.5">
                  Message <span className="text-zinc-400">(optional)</span>
                </label>
                <textarea
                  value={enquiry.message}
                  onChange={(e) => setEnquiry((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Tell us about your study goals, preferred universities, or any questions…"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {enquiryStatus === 'error' && (
                <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-red-600 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {enquiryError}
                </div>
              )}

              <button
                type="submit"
                disabled={enquiryStatus === 'loading'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 text-sm transition-colors"
              >
                {enquiryStatus === 'loading' && <Loader2 size={15} className="animate-spin" />}
                {enquiryStatus === 'loading' ? 'Submitting…' : 'Submit Enquiry'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer with subtle staff login */}
      <footer className="border-t border-zinc-200 px-6 py-6 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Staff login — expands inline when clicked */}
          {showLogin && (
            <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-5">
              <form onSubmit={submitLogin} className="space-y-3">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-widest mb-3">Staff Login</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={creds.username}
                    onChange={(e) => setCreds((p) => ({ ...p, username: e.target.value }))}
                    placeholder="Username"
                    required
                    autoComplete="username"
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                  <input
                    type="password"
                    value={creds.password}
                    onChange={(e) => setCreds((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Password"
                    required
                    autoComplete="current-password"
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />
                  <button
                    type="submit"
                    disabled={loginStatus === 'loading'}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-medium transition-colors flex-shrink-0"
                  >
                    {loginStatus === 'loading' && <Loader2 size={13} className="animate-spin" />}
                    {loginStatus === 'loading' ? 'Signing in…' : 'Sign In'}
                  </button>
                </div>
                {loginStatus === 'error' && (
                  <p className="text-xs text-red-500 flex items-center gap-1.5">
                    <AlertCircle size={12} />
                    {loginError}
                  </p>
                )}
              </form>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-800">
              &copy; {new Date().getFullYear()} University Education China · Helping international students study in China
            </p>
            <button
              onClick={() => setShowLogin((v) => !v)}
              className="text-xs font-bold text-zinc-900 hover:text-zinc-600 transition-colors"
            >
              {showLogin ? 'Cancel' : 'Staff Login'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
