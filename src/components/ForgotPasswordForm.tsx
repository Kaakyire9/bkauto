"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    const v = validate()
    if (v) { setError(v); return }

    setLoading(true)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (resetError) {
        setError(resetError.message || String(resetError))
      } else {
        setSubmitted(true)
        setMessage('Check your email for password reset instructions.')
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
      className="max-w-md w-full bg-[rgba(4,17,35,0.7)] backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl p-12 space-y-8 shadow-2xl"
      style={{
        boxShadow: '0 25px 60px rgba(2,6,23,0.8), inset 0 1px 0 rgba(212,175,55,0.05), 0 0 40px rgba(212,175,55,0.08)'
      }}
    >
      {/* Premium header with accent line */}
      <div className="space-y-3 border-b border-[#D4AF37]/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#D4AF37] to-transparent rounded-full"></div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight">Reset Password</h1>
        </div>
        <p className="text-sm text-[#C6CDD1]/60 ml-4">We'll send you a link to reset it</p>
      </div>

      {/* Status messages */}
      {error && (
        <div className="text-sm text-[#FFC7C7] bg-[#3a1b1b]/50 border border-[#E11D48]/30 p-4 rounded-lg">
          {error}
        </div>
      )}
      {message && (
        <div className="text-sm text-[#DFF7E6] bg-[#0b271a]/50 border border-[#10B981]/30 p-4 rounded-lg">
          {message}
        </div>
      )}

      {/* Email field or success state */}
      {!submitted ? (
        <>
          <label className="block group">
            <span className="text-sm font-medium text-[#D4AF37] mb-3 block group-focus-within:text-[#FFE17B] transition-colors">Email Address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
              placeholder="you@example.com"
              disabled={loading}
            />
          </label>

          <p className="text-xs text-[#C6CDD1]/60 leading-relaxed">
            Enter the email address associated with your BK Auto Trading account. We'll send you a secure link to reset your password.
          </p>

          {/* Submit button */}
          <div className="pt-2">
            <MotionPrimaryButton
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl font-bold text-lg"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </MotionPrimaryButton>
          </div>
        </>
      ) : (
        <>
          {/* Success state */}
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#10B981]/20 border border-[#10B981]/50 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#10B981]" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 011.414-1.414L8.414 12.586l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#10B981]">Check Your Email</h3>
              <p className="text-sm text-[#C6CDD1]/70">
                We've sent a password reset link to <span className="text-[#D4AF37] font-medium">{email}</span>
              </p>
              <p className="text-xs text-[#C6CDD1]/50 pt-2">
                The link will expire in 24 hours. If you don't receive it, check your spam folder or request a new link.
              </p>
            </div>
          </div>

          {/* Resend button */}
          <div className="pt-2">
            <MotionGhostButton
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full px-6 py-3 rounded-xl font-semibold text-white"
            >
              Send Another Link
            </MotionGhostButton>
          </div>
        </>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D4AF37]/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[rgba(4,17,35,0.7)] text-[#C6CDD1]/50">or</span>
        </div>
      </div>

      {/* Back to sign in link */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#C6CDD1]/60">Remember your password?</span>
        <MotionGhostButton
          type="button"
          onClick={() => router.push('/signin')}
          className="px-4 py-2 rounded-lg text-white underline-on-hover"
        >
          Sign in
        </MotionGhostButton>
      </div>

      {/* Footer text */}
      <p className="text-xs text-[#C6CDD1]/50 text-center border-t border-[#D4AF37]/10 pt-6">
        Need help? <a href="/support" className="text-[#D4AF37] hover:underline">Contact support</a>
      </p>
    </form>
  )
}
