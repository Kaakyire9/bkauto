"use client"
import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import PrimaryButton from './ui/PrimaryButton'
import GhostButton from './ui/GhostButton'
import NotificationsBell from './NotificationsBell'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import FocusTrap from 'focus-trap-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [user, setUser] = useState<any>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [isCompact, setIsCompact] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement | null>(null)
  const ringRefDesktop = useRef<HTMLDivElement | null>(null)
  const ringRefMobileHeader = useRef<HTMLDivElement | null>(null)
  const carRefMobileHeader = useRef<HTMLDivElement | null>(null)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)

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

  // Auto-rotate (use requestAnimationFrame to avoid React re-renders every frame)
  useEffect(() => {
    let mounted = true
    let rafId = 0
    const start = performance.now()
    function tick(now: number) {
      if (!mounted) return
      const rot = ((now - start) * 0.03) % 360
      if (ringRefDesktop.current) ringRefDesktop.current.style.transform = `rotate(${ -rot * 0.5 }deg)`
      if (ringRefMobileHeader.current) ringRefMobileHeader.current.style.transform = `rotate(${ -rot * 0.5 }deg)`
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => {
      mounted = false
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Hide on scroll down, show on scroll up + compact mode
  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0
    let ticking = false

    function onScroll() {
      const currentY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastY

          // Compact mode after 100px
          setIsCompact(currentY > 100)

          if (Math.abs(delta) < 10) {
            ticking = false
            return
          }

          if (delta > 0 && currentY > 120) {
            setShowHeader(false)
          } else if (delta < 0) {
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

  // Close menus on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        setAccountOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  // Accessibility & UX: scroll-lock and ARIA announcements; focus trap handled by focus-trap-react
  useEffect(() => {
    if (typeof window === 'undefined') return

    if (open) {
      const prevOverflow = document.body.style.overflow || ''
      document.body.style.overflow = 'hidden'
      setAnnounce('Menu opened')
      return () => {
        document.body.style.overflow = prevOverflow
        setAnnounce('Menu closed')
      }
    } else {
      // ensure the announcement clears after a short delay
      setAnnounce('Menu closed')
      const t = setTimeout(() => setAnnounce(''), 800)
      return () => clearTimeout(t)
    }
  }, [open])

  return (
    <AnimatePresence>
      <motion.header
        ref={(el) => { headerRef.current = el }}
        initial={{ y: -20, opacity: 0 }}
        animate={{
          y: showHeader ? 0 : headerRef.current ? -headerRef.current.offsetHeight - 8 : -120,
          opacity: showHeader ? 1 : 0
        }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="lg:fixed lg:left-4 lg:right-4 lg:top-4 lg:z-[9998] rounded-2xl border border-white/10 bg-dark/80 backdrop-blur-xl shadow-2xl transition-all"
      >
        <div aria-live="polite" role="status" className="sr-only">{announce}</div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="flex justify-between items-center relative"
            animate={{ height: isCompact ? '64px' : '80px' }}
            transition={{ duration: 0.3 }}
          >
            {/* LEFT SIDE - LOGO ONLY (desktop) */}
            <div className="hidden lg:flex items-center gap-6 flex-1">
              <Link href="/" className="flex items-center gap-3 shrink-0">
                <div className="w-14 h-14 relative overflow-hidden">
                  <Image
                    src="/images/bk-logo.png"
                    alt="BK Auto Trading"
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
                <span className="text-2xl md:text-3xl text-white font-extrabold tracking-tight whitespace-nowrap" style={{
                  fontFamily: "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                  textShadow: '0 2px 10px rgba(0,0,0,0.45)'
                }}>BK Auto Trading</span>
              </Link>
            </div>

            {/* CENTER - ROTATING CAR (inline with nav items) */}
            <motion.div 
              className="hidden lg:flex items-center justify-center mx-4"
              animate={{ 
                scale: isCompact ? 0.8 : 1,
                opacity: isCompact ? 0.8 : 1
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative flex items-center gap-3">
                {/* Car container */}
                <motion.div
                  className="relative flex items-center justify-center"
                  style={{ 
                    width: isCompact ? '50px' : '70px',
                    height: isCompact ? '50px' : '70px'
                  }}
                >
                  {/* Subtle glow behind */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full" />
                  
                  {/* Car Video - smaller to fit inside ring */}
                  <div className="w-[85%] h-[85%] flex items-center justify-center relative z-10">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-contain"
                      src="/videos/hero-video.mp4"
                    />
                  </div>

                  {/* Glowing animated ring indicator - DASHED CIRCLE - BIGGER */}
                  <div ref={ringRefDesktop} className="absolute inset-[-4px] rounded-full pointer-events-none">
                    <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(0deg)' }}>
                      <circle
                        cx="50%"
                        cy="50%"
                        r="48%"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        strokeDasharray="8 8"
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))' }}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#60A5FA" />
                          <stop offset="33%" stopColor="#A78BFA" />
                          <stop offset="66%" stopColor="#EC4899" />
                          <stop offset="100%" stopColor="#F97316" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* RIGHT SIDE - NAV LINKS + USER ACTIONS */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <nav className="hidden lg:flex items-center gap-1 mr-4">
                <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className="group px-4 py-2 rounded-lg hover:bg-white/5 transition-all relative overflow-hidden">
                  <span className="relative z-10 text-white/90 group-hover:text-white font-medium transition-colors">Home</span>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100" layoutId="navHover" />
                </Link>
                <Link href="/order" aria-current={pathname === '/order' ? 'page' : undefined} className="group px-4 py-2 rounded-lg hover:bg-white/5 transition-all relative">
                  <span className="relative z-10 text-white/90 group-hover:text-white font-medium transition-colors">Place Order</span>
                </Link>
                <Link href="/about" aria-current={pathname === '/about' ? 'page' : undefined} className="group px-4 py-2 rounded-lg hover:bg-white/5 transition-all relative">
                  <span className="relative z-10 text-white/90 group-hover:text-white font-medium transition-colors">About</span>
                </Link>
              </nav>

              <div className="hidden lg:flex items-center gap-3 relative">
                {authLoaded && user && <NotificationsBell />}
                {!user ? (
                  <>
                    <Link href="/signin" className="text-sm text-white/90 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all" style={{
                      textShadow: '0 1px 8px rgba(184, 176, 200, 0.25), 0 0 10px rgba(168, 85, 247, 0.25)'
                    }}>
                      Sign in
                    </Link>
                    <Link href="/signup">
                      <PrimaryButton>Sign up</PrimaryButton>
                    </Link>
                  </>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setAccountOpen(!accountOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                      aria-expanded={accountOpen}
                      aria-controls="account-menu"
                      aria-haspopup="true"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm text-white font-medium shadow-lg">
                        {user?.email?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                    </button>

                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          id="account-menu"
                          role="menu"
                          aria-hidden={!accountOpen}
                          className="absolute right-0 mt-2 w-56 rounded-xl bg-dark/90 backdrop-blur-xl border border-white/10 shadow-2xl p-2 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                          <Link href="/dashboard" className="relative block px-4 py-3 text-[#B8B0C8] hover:text-[#D4CBDF] hover:bg-white/5 rounded-lg transition-all">
                            Dashboard
                          </Link>
                          <Link href="/orders" className="relative block px-4 py-3 text-[#B8B0C8] hover:text-[#D4CBDF] hover:bg-white/5 rounded-lg transition-all">
                            Orders
                          </Link>
                          <Link href="/profile" className="relative block px-4 py-3 text-[#B8B0C8] hover:text-[#D4CBDF] hover:bg-white/5 rounded-lg transition-all">
                            Profile
                          </Link>
                          <div className="relative mt-2 px-2 pt-2 border-t border-white/10">
                            <GhostButton onClick={handleSignOut}>Sign out</GhostButton>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Mobile: Logo + Menu - Premium Layout */}
              <div className="flex lg:hidden items-center justify-between w-full relative">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-12 h-12 relative">
                    <Image
                      src="/images/bk-logo.png"
                      alt="BK Auto Trading"
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                  <span className="font-semibold text-lg md:text-xl text-white">BK Auto Trading</span>
                </Link>

                
                  {/* Mobile inline small video-in-ring (between logo and menu) */}
                  <div className="mx-3 flex items-center pointer-events-none">
                    <div className="w-9 h-9 relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-2xl rounded-full" />
                      <div ref={carRefMobileHeader} className="relative z-10 w-[70%] h-[70%] flex items-center justify-center pointer-events-none" aria-hidden="true">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain pointer-events-none"
                          src="/videos/hero-video.mp4"
                        />
                      </div>
                      <div ref={ringRefMobileHeader} className="absolute inset-[-4px] rounded-full pointer-events-none" aria-hidden="true">
                        <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(0deg)' }}>
                          <circle
                            cx="50%"
                            cy="50%"
                            r="48%"
                            fill="none"
                            stroke="url(#gradient-mobile-header)"
                            strokeWidth="2"
                            strokeDasharray="6 6"
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.7))' }}
                          />
                          <defs>
                            <linearGradient id="gradient-mobile-header" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#60A5FA" />
                              <stop offset="33%" stopColor="#A78BFA" />
                              <stop offset="66%" stopColor="#EC4899" />
                              <stop offset="100%" stopColor="#F97316" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>

                <button
                  className="inline-flex items-center justify-center p-2.5 rounded-xl text-white hover:bg-white/10 transition-all border border-white/10"
                  aria-controls="mobile-menu"
                  aria-expanded={open}
                  onClick={() => setOpen(!open)}
                  ref={menuButtonRef}
                >
                  <span className="sr-only">Open main menu</span>
                  <motion.div
                    animate={{ rotate: open ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {open ? (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                      </svg>
                    )}
                  </motion.div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Premium Mobile Menu (rendered into document.body to avoid stacking-context issues) */}
        {typeof document !== 'undefined' && createPortal(
          <div>
          <FocusTrap active={open} focusTrapOptions={{ onDeactivate: () => setOpen(false), clickOutsideDeactivates: true, returnFocusOnDeactivate: true }}>
          <AnimatePresence>
            {open && (
            <motion.div
              key="mobile-drawer"
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              id="mobile-menu"
              role="menu"
              aria-hidden={!open}
              className="lg:hidden fixed left-0 right-0 z-[9999] overflow-auto bg-black/15 backdrop-blur-md border-t border-white/10"
              style={{ top: headerRef.current ? `${headerRef.current.offsetHeight}px` : undefined }}
              ref={(el) => { mobileMenuRef.current = el as HTMLDivElement | null }}
            >
              <div className="px-6 pt-6 pb-8 space-y-1">
                
                {/* Mobile dropdown car/video removed to avoid duplication */}

                {/* User Info (if logged in) */}
                {authLoaded && user && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-3 px-4 py-4 rounded-xl bg-white/5 border border-white/10 mb-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-lg">
                      {user?.email?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-light text-sm">{user?.email}</p>
                      <p className="text-white/60 text-xs">Premium Member</p>
                    </div>
                    <NotificationsBell />
                  </motion.div>
                )}

                {/* Navigation Links */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-1"
                >
                  <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className="flex items-center gap-3 px-5 py-4 rounded-xl text-white hover:bg-white/10 transition-all group">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="font-light">Home</span>
                  </Link>
                  
                    {/* 'How it works' removed per request */}
                  
                  <Link href="/order" aria-current={pathname === '/order' ? 'page' : undefined} className="flex items-center gap-3 px-5 py-4 rounded-xl text-white hover:bg-white/10 transition-all group bg-white/5">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-light">Place Order</span>
                  </Link>
                  
                  <Link href="/about" aria-current={pathname === '/about' ? 'page' : undefined} className="flex items-center gap-3 px-5 py-4 rounded-xl text-white hover:bg-white/10 transition-all group">
                    <svg className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-light">About</span>
                  </Link>
                </motion.div>

                {/* Settings & Actions */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="border-t border-white/10 mt-6 pt-6 space-y-4"
                >
                  {/* Region Selector */}
                  <div>
                    <label className="block text-xs text-white/60 font-light mb-2 px-1">Region</label>
                    <select className="w-full border border-white/10 rounded-xl px-4 py-3 text-sm bg-white/5 text-white backdrop-blur-md hover:bg-white/10 transition-all">
                      <option>🌍 Global</option>
                      <option>🇺🇸 United States</option>
                      <option>🇪🇺 Europe</option>
                    </select>
                  </div>

                  {/* Auth Buttons or User Menu */}
                  {!user ? (
                    <div className="flex flex-col gap-3">
                      <Link href="/signin" className="flex items-center justify-center gap-2 px-5 py-3.5 border border-white/20 rounded-xl text-white hover:bg-white/5 transition-all font-light">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Sign in
                      </Link>
                      <Link href="/signup" className="flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white rounded-xl hover:shadow-2xl hover:shadow-purple-500/30 transition-all font-light">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Create Account
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link href="/dashboard" className="flex items-center gap-3 px-5 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/5 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link href="/orders" className="flex items-center gap-3 px-5 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/5 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Orders
                      </Link>
                      <Link href="/profile" className="flex items-center gap-3 px-5 py-3 rounded-xl text-white/90 hover:text-white hover:bg-white/5 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <div className="pt-3 border-t border-white/10">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl text-white/80 hover:text-white hover:bg-red-500/10 border border-red-500/20 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
            )}
          </AnimatePresence>
          </FocusTrap>
          </div>,
          document.body
        )}
      </motion.header>
    </AnimatePresence>
  )
}