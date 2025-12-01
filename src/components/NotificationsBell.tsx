"use client"
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Notification = {
  id: string
  title: string
  body?: string
  createdAt: string
  read?: boolean
}

export default function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const btnRef = useRef<HTMLButtonElement | null>(null)

  // mock notifications (replace with Supabase or API later)
  useEffect(() => {
    setNotifications([
      { id: '1', title: 'New offer received', body: 'Offer for your order #A123', createdAt: new Date().toISOString(), read: false },
      { id: '2', title: 'Sourcing started', body: 'We are searching for your car', createdAt: new Date().toISOString(), read: false },
      { id: '3', title: 'Message from agent', body: 'Please confirm your budget', createdAt: new Date().toISOString(), read: true }
    ])
  }, [])

  const unread = notifications.filter((n) => !n.read).length

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
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

  return (
    <div className="relative">
      <button
        ref={btnRef}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="relative inline-flex items-center p-2 rounded-md text-white hover:bg-dark/60"
        title="Notifications"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold text-black text-xs font-medium">{unread}</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 mt-2 w-72 rounded-md bg-dark/70 backdrop-blur-md border border-white/6 shadow-lg p-2 z-50"
          >
            <div className="flex items-center justify-between px-1">
              <h4 className="text-sm font-semibold text-white">Notifications</h4>
              <button onClick={markAllRead} className="text-xs text-neutral-200 hover:text-white">Mark all read</button>
            </div>

            <div className="mt-2 max-h-56 overflow-auto space-y-2">
              {notifications.length === 0 && <div className="text-sm text-neutral-300 p-2">No notifications</div>}
              {notifications.map((n) => (
                <div key={n.id} className={`p-2 rounded-md ${n.read ? 'bg-white/2' : 'bg-white/5'}`}>
                  <div className="text-sm font-medium text-white">{n.title}</div>
                  {n.body && <div className="text-xs text-neutral-300">{n.body}</div>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
