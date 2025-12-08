"use client"
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'

export default function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)
  const pwWrapperRef = useRef<HTMLLabelElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [popoverPlacement, setPopoverPlacement] = useState<'top' | 'right' | 'left'>('top')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const validate = () => {
    if (!email) return 'Email is required'
    if (!password || password.length < 8) return 'Password must be at least 8 characters'
    if (password !== confirm) return 'Passwords do not match'
    return null
  }

  // Password strength scoring
  const strength = useMemo(() => {
    const p = password || ''
    let score = 0
    if (p.length >= 8) score += 1
    if (p.length >= 12) score += 1
    if (/[a-z]/.test(p)) score += 1
    if (/[A-Z]/.test(p)) score += 1
    if (/[0-9]/.test(p)) score += 1
    if (/[^A-Za-z0-9]/.test(p)) score += 1

    const max = 6
    const pct = Math.min(100, Math.round((score / max) * 100))
    let label = 'Very weak'
    let color = '#E11D48' // red
    if (pct >= 80) { label = 'Very strong'; color = '#10B981' }
    else if (pct >= 60) { label = 'Strong'; color = '#059669' }
    else if (pct >= 40) { label = 'Good'; color = '#F59E0B' }
    else if (pct >= 20) { label = 'Fair'; color = '#F97316' }
    else { label = 'Very weak'; color = '#E11D48' }

    return { score, pct, label, color }
  }, [password])

  // Checklist criteria derived from the password
  const criteria = useMemo(() => {
    const p = password || ''
    return [
      { id: 'length8', label: 'At least 8 characters', ok: p.length >= 8 },
      { id: 'length12', label: '12+ characters (recommended)', ok: p.length >= 12 },
      { id: 'lower', label: 'Lowercase letter', ok: /[a-z]/.test(p) },
      { id: 'upper', label: 'Uppercase letter', ok: /[A-Z]/.test(p) },
      { id: 'number', label: 'A number', ok: /[0-9]/.test(p) },
      { id: 'symbol', label: 'A special character (e.g. !@#$)', ok: /[^A-Za-z0-9]/.test(p) }
    ]
  }, [password])

  // Compute and set placement for the popover based on available space.
  useEffect(() => {
    function updatePlacement() {
      const wrapper = pwWrapperRef.current
      const pop = popoverRef.current
      if (!wrapper || !pop) return

      const wrapRect = wrapper.getBoundingClientRect()
      const popRect = pop.getBoundingClientRect()
      const margin = 12

      const spaceRight = window.innerWidth - wrapRect.right
      const spaceLeft = wrapRect.left
      const spaceAbove = wrapRect.top

      // Check for an adjacent sibling (e.g. the confirm input) so we avoid
      // placing the popover to the right when it would overlap that field.
      let wouldOverlapRight = false
      let wouldOverlapLeft = false
      try {
        const gridParent = wrapper.parentElement
        if (gridParent) {
          const children = Array.from(gridParent.children)
          const idx = children.indexOf(wrapper)
          if (idx >= 0) {
            const next = children[idx + 1] as HTMLElement | undefined
            const prev = children[idx - 1] as HTMLElement | undefined
            if (next) {
              const nextRect = next.getBoundingClientRect()
              if (wrapRect.right + popRect.width + margin > nextRect.left) {
                wouldOverlapRight = true
              }
            }
            if (prev) {
              const prevRect = prev.getBoundingClientRect()
              if (wrapRect.left - (popRect.width + margin) < prevRect.right) {
                wouldOverlapLeft = true
              }
            }
          }
        }
      } catch (e) {
        // ignore measurement errors and fall back to simpler logic
      }

      // Prefer right/left on wide screens if enough room and no overlap with
      // adjacent grid columns, otherwise prefer top.
      if (window.innerWidth >= 768 && spaceRight > popRect.width + margin && !wouldOverlapRight) {
        setPopoverPlacement('right')
      } else if (window.innerWidth >= 768 && spaceLeft > popRect.width + margin && !wouldOverlapLeft) {
        setPopoverPlacement('left')
      } else if (spaceAbove > popRect.height + margin) {
        setPopoverPlacement('top')
      } else if (spaceRight > popRect.width + margin && !wouldOverlapRight) {
        setPopoverPlacement('right')
      } else if (spaceLeft > popRect.width + margin && !wouldOverlapLeft) {
        setPopoverPlacement('left')
      } else {
        // fallback to top
        setPopoverPlacement('top')
      }
    }

    if (pwFocused || password.length > 0) {
      // update immediately and attach listeners
      updatePlacement()
      window.addEventListener('resize', updatePlacement)
      window.addEventListener('scroll', updatePlacement, { passive: true })
      return () => {
        window.removeEventListener('resize', updatePlacement)
        window.removeEventListener('scroll', updatePlacement)
      }
    }
  }, [pwFocused, password])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const v = validate()
    if (v) { setError(v); return }

    setLoading(true)
    try {
      // Attempt sign up. If your Supabase instance expects additional options,
      // adjust the call accordingly.
      // Many supabase-js versions accept the second param for user metadata.
      // This code handles common v1/v2 variations gracefully.
      // Try v2-ish signature first, fall back if it fails.
      let result: any
      try {
        result = await (supabase.auth as any).signUp(
          { email, password },
          { data: { full_name: fullName } }
        )
      } catch (e) {
        // fallback to simpler call
        result = await (supabase.auth as any).signUp({ email, password })
      }

      const { error: signError } = result
      if (signError) {
        setError(signError.message || String(signError))
      } else {
        setMessage('Check your email to confirm your account (if email confirmations are enabled).')
        // Navigate to sign-in after a short delay so user sees the message
        setTimeout(() => router.push('/signin'), 1200)
      }
    } catch (e: any) {
      setError(e?.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl w-full bg-[rgba(4,17,35,0.6)] backdrop-blur-sm border border-[#D4AF37]/12 rounded-2xl p-10 space-y-6 shadow-2xl"
      style={{ boxShadow: '0 25px 60px rgba(2,6,23,0.6), inset 0 1px 0 rgba(212,175,55,0.02)' }}
    >
      <div>
        <h1 className="text-2xl font-bold text-[#D4AF37]">Create Account</h1>
        <p className="text-sm text-[#C6CDD1]/70 mt-1">Create an account to manage orders and favorites.</p>
      </div>

      {error && <div className="text-sm text-[#FFC7C7] bg-[#3a1b1b] p-3 rounded">{error}</div>}
      {message && <div className="text-sm text-[#DFF7E6] bg-[#0b271a] p-3 rounded">{message}</div>}

      <label className="block">
        <span className="text-sm text-[#C6CDD1]/70">Full name</span>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-2 w-full px-4 py-2 rounded-lg bg-[#041123]/24 border border-[#D4AF37]/8 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          placeholder="Your full name"
        />
      </label>

      <label className="block">
        <span className="text-sm text-[#C6CDD1]/70">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full px-4 py-2 rounded-lg bg-[#041123]/24 border border-[#D4AF37]/8 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
          placeholder="you@example.com"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label ref={pwWrapperRef} className="block relative">
          <span className="text-sm text-[#C6CDD1]/70">Password</span>
          <div className="mt-2 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwFocused(true)}
              onBlur={() => setPwFocused(false)}
              className="w-full pr-12 px-4 py-2 rounded-lg bg-[#041123]/24 border border-[#D4AF37]/8 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="At least 8 characters"
              aria-describedby="pw-strength pw-checklist"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-[#C6CDD1]/60 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                // Eye-off icon
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.09.173-2.137.492-3.106M3 3l18 18"/></svg>
              ) : (
                // Eye icon
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              )}
            </button>

            {/* Floating checklist popover anchored to this relative wrapper */}
            {(pwFocused || password.length > 0) && (
              <div
                id="pw-checklist"
                role="region"
                aria-live="polite"
                ref={popoverRef}
                className={
                  'absolute z-20 w-72 sm:w-80 p-3 bg-[#031420]/95 border border-[#D4AF37]/8 rounded-lg text-sm text-[#C6CDD1]/70 shadow-lg '
                }
                style={{ pointerEvents: 'auto', ...(popoverPlacement === 'top' ? { left: 0, bottom: '100%', marginBottom: '0.5rem' } : {}), ...(popoverPlacement === 'right' ? { left: '100%', top: 0, marginLeft: '0.75rem' } : {}), ...(popoverPlacement === 'left' ? { right: '100%', top: 0, marginRight: '0.75rem' } : {}) }}
              >
                {/* arrow */}
                <div aria-hidden style={{ position: 'absolute', pointerEvents: 'none', ...(popoverPlacement === 'top' ? { left: '1rem', bottom: '-6px', transform: 'rotate(180deg)' } : {}), ...(popoverPlacement === 'right' ? { left: '-6px', top: '1rem', transform: 'rotate(270deg)' } : {}), ...(popoverPlacement === 'left' ? { right: '-6px', top: '1rem', transform: 'rotate(90deg)' } : {}) }}>
                  <svg width="16" height="10" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="0,6 5,0 10,6" fill="#031420" stroke="#D4AF37" strokeWidth="0.6" />
                  </svg>
                </div>
                <div className="font-medium text-[#C6CDD1]/90 mb-2">Password must include</div>
                <ul className="space-y-1">
                  {criteria.map((c) => (
                    <li key={c.id} className="flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center rounded-full" style={{ background: c.ok ? '#052e1f' : '#2b0b0b' }}>
                        {c.ok ? (
                          <svg className="w-3 h-3 text-[#10B981]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 011.414-1.414L8.414 12.586l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                        ) : (
                          <svg className="w-3 h-3 text-[#E11D48]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 002 0V7zm-1 7a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" clipRule="evenodd"/></svg>
                        )}
                      </span>
                      <span className={`text-sm ${c.ok ? 'text-[#DFF7E6]' : 'text-[#C6CDD1]/60'}`}>{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* strength meter */}
          <div className="mt-2" aria-live="polite">
            <div id="pw-strength" className="h-2 rounded-full bg-[#0b1320]/40 overflow-hidden">
              <div style={{ width: `${strength.pct}%`, background: strength.color, height: '100%' }} />
            </div>
            <div className="text-xs mt-1 text-[#C6CDD1]/60">{password ? strength.label : 'Enter a password'}</div>
          </div>
        </label>

        <label className="block relative">
          <span className="text-sm text-[#C6CDD1]/70">Confirm</span>
          <div className="mt-2 relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full pr-12 px-4 py-2 rounded-lg bg-[#041123]/24 border border-[#D4AF37]/8 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20"
              placeholder="Repeat password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-[#C6CDD1]/60 hover:text-white"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.04-5.813M3 3l18 18"/></svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              )}
            </button>
          </div>
        </label>
      </div>

      <div className="flex gap-3 items-center">
        <MotionPrimaryButton type="submit" disabled={loading} className="px-6 py-2 rounded-lg font-semibold">
          {loading ? 'Creating…' : 'Create Account'}
        </MotionPrimaryButton>

        <MotionGhostButton type="button" onClick={() => router.push('/signin')} className="px-4 py-2 rounded-lg text-white underline-on-hover">
          Sign in
        </MotionGhostButton>
      </div>

      <p className="text-xs text-[#C6CDD1]/60">By creating an account you agree to our <a href="/terms" className="underline">Terms</a>.</p>
    </form>
  )
}
