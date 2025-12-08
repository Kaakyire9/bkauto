"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'

export default function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const validate = () => {
    if (!email) return 'Email is required'
    if (!password) return 'Password is required'
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) {
        setError(signInError.message || String(signInError))
      } else if (data?.session) {
        setMessage('Successfully signed in! Redirecting...')
        setTimeout(() => router.push('/dashboard'), 1000)
      } else {
        setError('Sign in failed. Please try again.')
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
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight">Welcome Back</h1>
        </div>
        <p className="text-sm text-[#C6CDD1]/60 ml-4">Access your premium account</p>
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

      {/* Email field */}
      <label className="block group">
        <span className="text-sm font-medium text-[#D4AF37] mb-3 block group-focus-within:text-[#FFE17B] transition-colors">Email Address</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-3 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
          placeholder="you@example.com"
        />
      </label>

      {/* Password field */}
      <label className="block relative group">
        <span className="text-sm font-medium text-[#D4AF37] mb-3 block group-focus-within:text-[#FFE17B] transition-colors">Password</span>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 pr-12 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#C6CDD1]/50 hover:text-[#D4AF37] transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.09.173-2.137.492-3.106M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </label>

      {/* Forgot password link */}
      <div className="flex justify-end">
        <a href="/forgot-password" className="text-xs text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors underline-on-hover inline-block">
          Forgot password?
        </a>
      </div>

      {/* Sign in button */}
      <div className="pt-2">
        <MotionPrimaryButton
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-xl font-bold text-lg"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </MotionPrimaryButton>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D4AF37]/10"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-2 bg-[rgba(4,17,35,0.7)] text-[#C6CDD1]/50">or</span>
        </div>
      </div>

      {/* Sign up link */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-[#C6CDD1]/60">Don't have an account?</span>
        <MotionGhostButton
          type="button"
          onClick={() => router.push('/signup')}
          className="px-4 py-2 rounded-lg text-white underline-on-hover"
        >
          Create one
        </MotionGhostButton>
      </div>

      {/* Footer text */}
      <p className="text-xs text-[#C6CDD1]/50 text-center border-t border-[#D4AF37]/10 pt-6">
        By signing in, you agree to our <a href="/terms" className="text-[#D4AF37] hover:underline">Terms of Service</a>
      </p>
    </form>
  )
}
