"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabaseClient'
import { usePathname, useRouter } from 'next/navigation'

type Notification = {
  id: string
  title: string
  body?: string
  type?: string
  order_id?: string | null
  created_at: string
  read?: boolean
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Fetch notifications from Supabase
  useEffect(() => {
    let mounted = true

    async function fetchNotifications() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session || !mounted) return

        const uid = session.user.id
        setUserId(uid)

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Error fetching notifications:', error)
          return
        }

        if (mounted && data) {
          setNotifications(data)
        }
      } catch (err) {
        console.error('Notification fetch error:', err)
      }
    }

    fetchNotifications()

    return () => {
      mounted = false
    }
  }, [])

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setNotifications((prev) =>
              prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
            )
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const unread = notifications.filter((n) => !n.read).length

  async function markAllRead() {
    if (!userId) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking notifications as read:', error)
    } else {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }
  }

  async function markRead(id: string) {
    if (!userId) return
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  function handleNotificationClick(n: Notification) {
    // Best-effort mark as read; ignore failure in UI flow
    if (!n.read) {
      markRead(n.id)
    }

    if (n.type === 'message' && n.order_id) {
      const isAdmin = pathname?.startsWith('/admin')
      if (isAdmin) {
        router.push(`/admin?orderId=${encodeURIComponent(n.order_id)}`)
      } else {
        router.push(`/orders/${encodeURIComponent(n.order_id)}`)
      }
      setOpen(false)
      return
    }

    // Other notification types: no-op for now (could extend later)
  }

  // close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return
      const target = e.target as Node
      if (btnRef.current && btnRef.current.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  function formatTime(isoString: string) {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="relative inline-flex items-center p-2 rounded-md text-white hover:bg-[#041123]/60 transition-colors"
        title="Notifications"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#E11D48] text-white text-xs font-bold"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="fixed lg:absolute right-4 lg:right-0 top-20 lg:top-auto lg:mt-2 w-80 rounded-xl bg-[#041123]/95 backdrop-blur-xl border border-[#D4AF37]/20 shadow-2xl p-3 z-[9999]"
          >
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#6B667A]/20">
              <h4 className="text-sm font-bold text-[#D4AF37]">Notifications</h4>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#C6CDD1] hover:text-[#D4AF37] transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="mt-2 max-h-96 overflow-auto space-y-2">
              {notifications.length === 0 && (
                <div className="text-sm text-[#C6CDD1]/60 p-4 text-center">No notifications</div>
              )}
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    n.read
                      ? 'bg-[#041123]/40 hover:bg-[#041123]/60'
                      : 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30'
                  }`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${n.read ? 'text-[#C6CDD1]' : 'text-[#D4AF37]'}`}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div className="text-xs text-[#C6CDD1]/70 mt-1 line-clamp-2">{n.body}</div>
                      )}
                      <div className="text-xs text-[#C6CDD1]/50 mt-1">{formatTime(n.created_at)}</div>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#E11D48] mt-1"></div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
