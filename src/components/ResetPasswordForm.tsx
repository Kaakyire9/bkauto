"use client"
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'

export default function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validate = () => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    if (!confirm) return 'Please confirm your password'
    if (password !== confirm) return 'Passwords do not match'
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
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message || 'Failed to reset password')
      } else {
        setSuccess(true)
        setMessage('Password reset successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (e: any) {
      setError(e?.message || 'An error occurred while resetting your password')
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
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-tight">Create New Password</h1>
        </div>
        <p className="text-sm text-[#C6CDD1]/60 ml-4">Enter a strong password to secure your account</p>
      </div>

      {/* Status messages */}
      {error && (
        <div className="text-sm text-[#FFC7C7] bg-[#3a1b1b]/50 border border-[#E11D48]/30 p-4 rounded-lg">
          {error}
        </div>
      )}
      {message && (
        <div className={`text-sm p-4 rounded-lg border ${
          success
            ? 'text-[#DFF7E6] bg-[#0b271a]/50 border-[#10B981]/30'
            : 'text-[#FFC7C7] bg-[#3a1b1b]/50 border-[#E11D48]/30'
        }`}>
          {message}
        </div>
      )}

      {!success ? (
        <>
          {/* Password field */}
          <label className="block relative group">
            <span className="text-sm font-medium text-[#D4AF37] mb-3 block group-focus-within:text-[#FFE17B] transition-colors">New Password</span>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 pr-12 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
                placeholder="At least 8 characters"
                disabled={loading}
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

          {/* Confirm Password field */}
          <label className="block relative group">
            <span className="text-sm font-medium text-[#D4AF37] mb-3 block group-focus-within:text-[#FFE17B] transition-colors">Confirm Password</span>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-5 py-3 pr-12 rounded-xl bg-[#041123]/40 border border-[#D4AF37]/15 focus:border-[#D4AF37]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 transition-all text-white placeholder-[#C6CDD1]/40"
                placeholder="Repeat password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#C6CDD1]/50 hover:text-[#D4AF37] transition-colors"
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.99 9.99 0 012.04-5.813M3 3l18 18" />
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

          <p className="text-xs text-[#C6CDD1]/60 leading-relaxed">
            Make sure your new password is at least 8 characters long and different from your previous password.
          </p>

          {/* Submit button */}
          <div className="pt-2">
            <MotionPrimaryButton
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
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
              <h3 className="text-lg font-bold text-[#10B981]">Password Reset Successful</h3>
              <p className="text-sm text-[#C6CDD1]/70">
                Your password has been updated. You'll be redirected to your dashboard shortly.
              </p>
            </div>
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
        <span className="text-sm text-[#C6CDD1]/60">Ready to sign in?</span>
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
