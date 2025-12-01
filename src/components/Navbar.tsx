"use client"
import React, { useEffect, useState, Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import PrimaryButton from './ui/PrimaryButton'
import GhostButton from './ui/GhostButton'
import NotificationsBell from './NotificationsBell'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const router = useRouter()
  const headerRef = React.useRef<HTMLElement | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (mounted) setUser(data?.user ?? null)
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setAuthLoaded(true)
      }
    })()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      setAuthLoaded(true)
    })

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe()
    }
  }, [])

  // hide on scroll down, show on scroll up (smooth)
  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0
    let ticking = false

    function onScroll() {
      const currentY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastY
          // small threshold
          if (Math.abs(delta) < 10) {
            ticking = false
            return
          }

          if (delta > 0 && currentY > 120) {
            // scrolling down
            setShowHeader(false)
          } else if (delta < 0) {
            // scrolling up
            setShowHeader(true)
          }

          lastY = currentY
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  // floating glass header style and animations
  return (
    <AnimatePresence>
      <motion.header
        ref={(el) => { headerRef.current = el }}
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: showHeader ? 0 : headerRef.current ? -headerRef.current.offsetHeight - 8 : -80,
          opacity: showHeader ? 1 : 0
        }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="lg:fixed lg:left-4 lg:right-4 lg:top-4 lg:z-40 rounded-xl border border-white/6 bg-dark/60 backdrop-blur-lg shadow-lg transition-transform"
      >
        <div className="max-w-7xl mx-auto pl-4 pr-6 sm:pl-6 sm:pr-8 lg:pl-8 lg:pr-10">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 relative overflow-hidden">
                  <Image
                    src="/images/bk-logo.png"
                    alt="BK Auto Trading"
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 32px, (max-width: 1024px) 40px, 48px"
                  />
                </div>
                <span className="font-thin text-sm md:text-lg lg:text-xl text-white">BK Auto Trading</span>
              </Link>
                <nav className="hidden md:flex items-center gap-2 text-sm text-neutral-100">
                <Link href="/" className="px-3 py-2 rounded hover:bg-dark/70">Home</Link>
                <Link href="/how-it-works" className="px-3 py-2 rounded hover:bg-dark/70">How it works</Link>
                <Link href="/order" className="px-3 py-2 rounded hover:bg-dark/70">Place Order</Link>
                <Link href="/about" className="px-3 py-2 rounded hover:bg-dark/70">About</Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <label htmlFor="region" className="sr-only">Region</label>
                <select id="region" name="region" className="border rounded px-2 py-1 text-sm bg-dark/30 text-white">
                  <option>Global</option>
                  <option>US</option>
                  <option>Europe</option>
                  <option>Canada</option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-3 relative">
                {authLoaded && user && <NotificationsBell />}
                {!user ? (
                  <>
                    <Link href="/signin" className="text-sm text-white">Sign in</Link>
                    <Link href="/signup">
                      <PrimaryButton>Sign up</PrimaryButton>
                    </Link>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2"
                      aria-expanded={accountOpen}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm text-white">{user?.email?.[0]?.toUpperCase() ?? 'U'}</div>
                    </button>

                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className="absolute right-0 mt-2 w-48 rounded-md bg-dark/70 backdrop-blur-md border border-white/6 shadow-lg p-2"
                        >
                          <Link href="/dashboard" className="block px-3 py-2 text-white hover:bg-white/5 rounded">Dashboard</Link>
                          <Link href="/orders" className="block px-3 py-2 text-white hover:bg-white/5 rounded">Orders</Link>
                          <Link href="/profile" className="block px-3 py-2 text-white hover:bg-white/5 rounded">Profile</Link>
                          <div className="mt-2 px-2">
                            <GhostButton onClick={handleSignOut}>Sign out</GhostButton>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden inline-flex items-center justify-center p-2 mr-3 rounded-md text-white hover:bg-white/6"
                aria-controls="mobile-menu"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
              >
                <span className="sr-only">Open main menu</span>
                {open ? (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Animated Drawer */}
        <AnimatePresence>
          {open && (
            <motion.div
              key="mobile-drawer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden bg-dark/70"
            >
                <div className="px-4 pt-4 pb-6 space-y-3">
                {authLoaded && user && (
                  <div className="px-3">
                    <NotificationsBell />
                  </div>
                )}
                <Link href="/" className="block px-3 py-2 rounded text-base font-medium text-white">Home</Link>
                <Link href="/how-it-works" className="block px-3 py-2 rounded text-base font-medium text-white">How it works</Link>
                <Link href="/order" className="block px-3 py-2 rounded text-base font-medium text-white">Place Order</Link>
                <Link href="/about" className="block px-3 py-2 rounded text-base font-medium text-white">About</Link>

                <div className="border-t border-white/8 mt-2 pt-3">
                  <label htmlFor="region-mobile" className="block text-sm text-white mb-1">Region</label>
                  <select id="region-mobile" name="region" className="w-full border rounded px-2 py-1 text-sm bg-white/8 text-white">
                    <option>Global</option>
                    <option>US</option>
                    <option>Europe</option>
                    <option>Canada</option>
                  </select>

                  <div className="mt-3 flex gap-2">
                    <Link href="/signin" className="flex-1 text-center px-3 py-2 border rounded text-white">Sign in</Link>
                    <Link href="/signup" className="flex-1 text-center px-3 py-2 bg-secondary text-white rounded">Sign up</Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </AnimatePresence>
  )
}
