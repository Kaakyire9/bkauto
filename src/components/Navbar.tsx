"use client"
import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'
import NotificationsBell from './NotificationsBell'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { createPortal } from 'react-dom'
import FocusTrap from 'focus-trap-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [user, setUser] = useState<any>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [authLoaded, setAuthLoaded] = useState(false)
  const [showHeader, setShowHeader] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const [overlayActive, setOverlayActive] = useState(false)
  const accountButtonRef = useRef<HTMLButtonElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)

  const ModelViewerClient = dynamic(() => import('./ModelViewerClient'), {
    ssr: false,
    loading: () => (
      <div className="h-56 bg-[#041123]/20 rounded-xl flex items-center justify-center text-sm text-[#C6CDD1]/60">Loading 3D preview…</div>
    )
  })
  const modelViewerRef = React.useRef<import('./ModelViewerClient').ModelViewerHandle | null>(null)

  function openMenu() {
    setOverlayActive(false)
    setOpen(true)
  }

  function closeMenu() {
    setOverlayActive(false)
    setOpen(false)
  }

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

  useEffect(() => {
    let lastY = typeof window !== 'undefined' ? window.scrollY : 0
    let ticking = false

    function onScroll() {
      const currentY = window.scrollY
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const delta = currentY - lastY
          setScrolled(currentY > 20)

          if (Math.abs(delta) < 10) {
            ticking = false
            return
          }

          if (delta > 0 && currentY > 100) {
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

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

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

  // Close account menu on outside click (desktop)
  useEffect(() => {
    if (!accountOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      const btn = accountButtonRef.current
      const menu = accountMenuRef.current
      if (menu && menu.contains(target)) return
      if (btn && btn.contains(target)) return
      setAccountOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside, true)
    return () => document.removeEventListener('mousedown', handleClickOutside, true)
  }, [accountOpen])

  // Close account menu on route change
  useEffect(() => {
    if (accountOpen) setAccountOpen(false)
    // also ensure mobile menu closes on navigation
    if (open) setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (typeof window === 'undefined') return

    let scrollY = 0
    if (open) {
      scrollY = window.scrollY || 0
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      setAnnounce('Menu opened')
    } else {
      const top = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      if (top) {
        const y = parseInt(top || '0', 10) * -1
        window.scrollTo(0, y)
      }
      if (announce) setAnnounce('Menu closed')
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
    }
  }, [open])

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/order', label: 'Place Order' },
    { href: '/about', label: 'About' }
  ]

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: showHeader ? 0 : -100, 
          opacity: showHeader ? 1 : 0 
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-[90] transition-all duration-500 ${
          scrolled
            ? 'bg-[#041123]/90 backdrop-blur-lg shadow-2xl shadow-black/40'
            : 'bg-[#041123]/60 backdrop-blur-sm'
        }`}
        style={{
          borderBottom: scrolled ? '1px solid rgba(212, 175, 55, 0.12)' : '1px solid rgba(212, 175, 55, 0.06)'
        }}
      >
        {/* Luxurious gold accent line */}
        <motion.div 
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0"
          animate={{ opacity: scrolled ? 0.6 : 0 }}
          transition={{ duration: 0.5 }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Premium Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group relative">
              <motion.div 
                className="relative w-20 h-20 lg:w-24 lg:h-24"
                whileHover={{ scale: 1.05, rotateY: 15 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#1257D8] to-[#C21E3A] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
                <Image
                  src="/images/bk-logo1.png"
                  alt="BK Auto Trading"
                  fill
                  className="object-contain relative z-10 drop-shadow-2xl"
                  sizes="96px"
                  priority
                />
              </motion.div>
              <div className="block min-w-0">
                <motion.span 
                  className="block font-bold text-base sm:text-xl lg:text-2xl truncate bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent"
                  style={{
                    textShadow: '0 0 30px rgba(212, 175, 55, 0.3)'
                  }}
                >
                  BK AUTO TRADING
                </motion.span>
                <span className="hidden sm:block text-xs lg:text-sm text-[#C6CDD1]/60 tracking-[0.3em] font-light">
                  ESTD 2015
                </span>
              </div>
            </Link>

            {/* Desktop Navigation - Royal styling */}
            <nav className="hidden lg:flex items-center gap-2 relative">
              {/* Decorative element */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-30" />
              
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  className="relative px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 group"
                >
                  <span className={`relative z-10 transition-all duration-300 ${
                    pathname === item.href 
                      ? 'text-[#D4AF37]' 
                      : 'text-[#C6CDD1]/80 group-hover:text-[#D4AF37]'
                  }`}>
                    {item.label}
                  </span>
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#D4AF37]/5 via-[#1257D8]/5 to-[#C21E3A]/5 opacity-0 group-hover:opacity-100"
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Active indicator */}
                  {pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5"
                      style={{
                        background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
                        boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  
                  {/* Bottom accent on hover */}
                  <motion.div
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-[#C6CDD1] to-transparent opacity-0 group-hover:opacity-100 group-hover:w-full transition-all duration-300"
                  />
                </Link>
              ))}
              
              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-30" />
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {authLoaded && user && (
                <div className="relative">
                  <NotificationsBell />
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C21E3A]"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              )}
              
              {!user ? (
                <>
                  <Link href="/signin">
                    <MotionGhostButton
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-5 py-2.5 text-sm font-medium text-white hover:text-[#D4AF37] transition-all duration-300 relative group"
                    >
                      <span className="relative z-10">Sign in</span>
                      <div className="absolute inset-0 rounded-lg border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/30 transition-all duration-300" />
                    </MotionGhostButton>
                  </Link>
                  <Link href="/signup">
                    <MotionPrimaryButton
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative px-6 py-2.5 text-sm font-semibold rounded-lg overflow-hidden group bg-deep-red hover:bg-cherry-red text-white"
                    >
                      <span className="relative z-10">Sign up</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#C21E3A]/20 via-[#1257D8]/20 to-[#0FA662]/20"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                    </MotionPrimaryButton>
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="relative flex items-center gap-3 px-4 py-2 rounded-xl group"
                    aria-expanded={accountOpen}
                    aria-controls="account-menu"
                    aria-haspopup="true"
                    ref={accountButtonRef}
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(18, 87, 216, 0.1))',
                      border: '1px solid rgba(212, 175, 55, 0.2)'
                    }}
                  >
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-[#041123] font-bold relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #D4AF37 0%, #C6CDD1 50%, #1257D8 100%)',
                        boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
                      }}
                    >
                      {user?.email?.[0]?.toUpperCase() ?? 'U'}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <svg 
                      className={`w-4 h-4 text-[#D4AF37] transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  <AnimatePresence>
                    {accountOpen && (
                      <>
                        <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-[100]"
                                onClick={() => setAccountOpen(false)}
                              />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                                id="account-menu"
                                role="menu"
                                className="absolute right-0 mt-3 w-72 rounded-2xl overflow-hidden z-[110]"
                                ref={accountMenuRef}
                          style={{
                            background: 'linear-gradient(135deg, #041123 0%, #0a1a2e 100%)',
                            border: '1px solid rgba(212, 175, 55, 0.2)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)'
                          }}
                        >
                          {/* Crown decoration */}
                          <div className="h-1 bg-gradient-to-r from-[#C21E3A] via-[#D4AF37] to-[#1257D8]" />
                          
                          <div className="p-4 border-b border-[#D4AF37]/10">
                            <p className="text-sm text-[#D4AF37] font-semibold truncate">{user?.email}</p>
                            <p className="text-xs text-[#C6CDD1]/50 mt-1 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0FA662]" />
                              Premium Member
                            </p>
                          </div>
                          
                          <div className="p-2">
                            {[
                              { href: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                              { href: '/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                              { href: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
                            ].map((item, i) => (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                              >
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-[#C6CDD1]/80 hover:text-[#D4AF37] rounded-xl transition-all group relative overflow-hidden"
                                  onClick={() => setAccountOpen(false)}
                                >
                                  <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                  </svg>
                                  <span className="relative z-10 font-medium">{item.label}</span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              </motion.div>
                            ))}
                          </div>

                          <div className="p-2 border-t border-[#D4AF37]/10">
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-[#C21E3A] hover:text-white rounded-xl transition-all relative group overflow-hidden"
                              style={{
                                background: 'linear-gradient(135deg, rgba(194, 30, 58, 0.1), rgba(229, 57, 53, 0.1))'
                              }}
                            >
                              <svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="relative z-10 font-semibold">Sign out</span>
                              <div className="absolute inset-0 bg-[#C21E3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-3 rounded-xl relative group z-[200]"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(18, 87, 216, 0.1))',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => { if (!open) openMenu(); else closeMenu() }}
              ref={menuButtonRef}
            >
              <span className="sr-only">Open menu</span>
              <motion.div
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {open ? (
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Bottom royal accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent" />
      </motion.header>

      {/* Mobile Menu - Luxurious Side Panel */}
      {isMounted && createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[95] lg:hidden ${overlayActive ? '' : 'pointer-events-none'}`}
                onAnimationComplete={() => setOverlayActive(true)}
                onClick={() => { if (overlayActive) closeMenu() }}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                id="mobile-menu"
                role="menu"
                className="fixed top-0 right-0 bottom-0 w-full max-w-sm z-[100] lg:hidden overflow-y-auto"
                style={{
                  background: 'linear-gradient(135deg, #041123 0%, #0a1a2e 100%)',
                  borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)',
                  // respect iOS safe area inset at the bottom
                  paddingBottom: 'env(safe-area-inset-bottom, 0px)'
                }}
                ref={mobileMenuRef}
              >
                <FocusTrap
                  active={open && overlayActive}
                  focusTrapOptions={{
                    onDeactivate: () => setOpen(false),
                    clickOutsideDeactivates: true,
                    returnFocusOnDeactivate: true,
                    escapeDeactivates: true,
                    initialFocus: '#mobile-menu'
                  }}
                >
                  <div className="relative h-full flex flex-col">
                    {/* Royal top accent */}
                    <div className="h-1 bg-gradient-to-r from-[#C21E3A] via-[#D4AF37] to-[#1257D8]" />

                    {/* Scrollable content */}
                    <div className="p-6 space-y-6 overflow-y-auto flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-12 relative">
                            <Image
                              src="/images/bk-logo1.png"
                              alt="BK"
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-[#D4AF37]">Menu</h2>
                            <p className="text-xs text-[#C6CDD1]/50">Premium Access</p>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => closeMenu()}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-lg"
                          aria-label="Close menu"
                          title="Close"
                          style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.06), rgba(10,26,46,0.06))',
                            border: '1px solid rgba(212, 175, 55, 0.08)'
                          }}
                        >
                          <svg className="w-5 h-5 text-[#D4AF37]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </div>

                      {/* (Pinned footer badge moved to absolute position near bottom) */}
                      {user && (
                        <div className="relative p-5 rounded-2xl overflow-hidden"
                          style={{
                            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(18, 87, 216, 0.1))',
                            border: '1px solid rgba(212, 175, 55, 0.2)'
                          }}
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-3xl" />
                          <div className="relative flex items-center gap-3">
                            <div 
                              className="w-14 h-14 rounded-full flex items-center justify-center text-[#041123] font-bold relative"
                              style={{
                                background: 'linear-gradient(135deg, #D4AF37 0%, #C6CDD1 50%, #1257D8 100%)',
                                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.4)'
                              }}
                            >
                              {user?.email?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-[#D4AF37] font-semibold truncate">{user?.email}</p>
                              <p className="text-xs text-[#C6CDD1]/50 flex items-center gap-1 mt-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0FA662]" />
                                Premium Member
                              </p>
                            </div>
                            <NotificationsBell />
                          </div>
                        </div>
                      )}

                      {/* Navigation */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2 mb-3">
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                          <span className="text-xs text-[#C6CDD1]/50 font-medium tracking-widest">NAVIGATION</span>
                          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                        </div>
                        
                        {navItems.map((item, index) => {
                          const icons = [
                            'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                            'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
                            'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          ]
                          return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={item.href}
                              aria-current={pathname === item.href ? 'page' : undefined}
                              className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all relative overflow-hidden group ${
                                pathname === item.href
                                  ? 'text-[#D4AF37]'
                                  : 'text-[#C6CDD1]/80 hover:text-[#D4AF37]'
                              }`}
                              onClick={() => closeMenu()}
                              style={pathname === item.href ? {
                                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(18, 87, 216, 0.1))',
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                              } : {}}
                            >
                              <svg className="w-5 h-5 flex-shrink-0 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[index]} />
                              </svg>
                              <span className="font-medium relative z-10">{item.label}</span>
                              {pathname !== item.href && (
                                <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </Link>
                          </motion.div>
                        )})}

                        {/* User Actions */}
                        {user ? (
                          <div className="space-y-2 pt-6 border-t border-[#D4AF37]/10 mt-6">
                            <div className="flex items-center gap-2 px-2 mb-3">
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                              <span className="text-xs text-[#C6CDD1]/50 font-medium tracking-widest">ACCOUNT</span>
                              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
                            </div>
                            
                            {[
                              { href: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                              { href: '/orders', label: 'My Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                              { href: '/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
                            ].map((item, i) => (
                              <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (navItems.length + i) * 0.1 }}
                              >
                                <Link
                                  href={item.href}
                                  className="flex items-center gap-4 px-5 py-4 text-[#C6CDD1]/80 hover:text-[#D4AF37] rounded-xl transition-all group relative overflow-hidden"
                                  onClick={() => setOpen(false)}
                                >
                                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                  </svg>
                                  <span className="relative z-10">{item.label}</span>
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                              </motion.div>
                            ))}
                            
                            <motion.button
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (navItems.length + 3) * 0.1 }}
                              onClick={handleSignOut}
                              className="w-full flex items-center justify-center gap-3 px-5 py-4 mt-4 text-[#C21E3A] hover:text-white rounded-xl transition-all relative group overflow-hidden"
                              style={{
                                background: 'linear-gradient(135deg, rgba(194, 30, 58, 0.15), rgba(229, 57, 53, 0.1))',
                                border: '1px solid rgba(194, 30, 58, 0.3)'
                              }}
                            >
                              <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="relative z-10 font-semibold">Sign out</span>
                              <div className="absolute inset-0 bg-[#C21E3A]/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </motion.button>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-6 border-t border-[#D4AF37]/10 mt-6">
                            <Link href="/signin" onClick={() => closeMenu()}>
                              <MotionGhostButton
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="block w-full text-center px-5 py-4 text-white rounded-xl transition-all relative overflow-hidden group"
                                style={{ border: '1px solid rgba(212, 175, 55, 0.3)' }}
                              >
                                <span className="relative z-10 font-medium">Sign in</span>
                                <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </MotionGhostButton>
                            </Link>
                            <Link href="/signup" onClick={() => closeMenu()}>
                              <MotionPrimaryButton
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full px-5 py-4 rounded-xl font-semibold relative overflow-hidden bg-deep-red hover:bg-cherry-red text-white"
                              >
                                <span className="relative z-10">Create Account</span>
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-[#C21E3A]/20 via-[#1257D8]/20 to-[#0FA662]/20"
                                  animate={{ x: ['-100%', '100%'] }}
                                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />
                              </MotionPrimaryButton>
                            </Link>
                          </div>
                        )}
                      </div>

                      {/* Footer Badge */}
                      {/* 3D Preview (MVP) */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-[#D4AF37]">3D Preview</h3>
                          <span className="text-xs text-[#C6CDD1]/50">Try in AR</span>
                        </div>
                          <div className="mb-4">
                            <ModelViewerClient viewerRef={modelViewerRef} src="/models/vehicle_draco.glb" />
                          </div>

                          {/* Color swatches */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#D4AF37]">Colors</span>
                              <span className="text-xs text-[#C6CDD1]/50">Tap to apply</span>
                            </div>
                            <div className="flex gap-2">
                              {[
                                { hex: '#ffffff', label: 'White' },
                                { hex: '#000000', label: 'Black' },
                                { hex: '#D4AF37', label: 'Gold' },
                                { hex: '#FF0000', label: 'Red' },
                                { hex: '#1257D8', label: 'Blue' },
                                { hex: '#0FA662', label: 'Green' }
                              ].map((c) => (
                                <button
                                  key={c.hex}
                                  title={c.label}
                                  onClick={async () => {
                                    try {
                                      // try applying to material name 'body' or generic null (apply to all meshes)
                                      const ok1 = await modelViewerRef.current?.setMaterialColor('body', c.hex)
                                      const ok2 = await modelViewerRef.current?.setMaterialColor(null, c.hex)
                                      // if neither succeeded, quietly continue
                                      void ok1; void ok2
                                    } catch (e) {
                                      console.warn('color apply failed', e)
                                    }
                                  }}
                                  className="w-10 h-10 rounded-full border-2 border-[#041123]/10 shadow-inner"
                                  style={{ background: c.hex }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Link href="/order">
                              <MotionPrimaryButton onClick={() => closeMenu()} className="flex-1 text-center px-4 py-2 rounded-xl font-semibold">
                                Order This
                              </MotionPrimaryButton>
                            </Link>
                            <MotionGhostButton onClick={() => { /* placeholder for extra actions */ }} className="px-4 py-2 rounded-xl border border-[#D4AF37]/20 text-[#D4AF37]">
                              Info
                            </MotionGhostButton>
                          </div>
                      </div>

                      {/* Badge removed: 'ESTD 2018 • Premium Service' was intentionally removed from the menu */}
                    </div>
                  </div>
                </FocusTrap>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Accessibility announcer */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announce}
      </div>
    </>
  )
}