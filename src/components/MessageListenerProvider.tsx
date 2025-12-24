"use client"
import { useEffect, useRef } from "react"
import { supabase } from "../lib/supabaseClient"
import toast from "react-hot-toast"

interface MessageListenerProviderProps {
  currentUserId: string
  children: React.ReactNode
}

export default function MessageListenerProvider({ currentUserId, children }: MessageListenerProviderProps) {
  const lastToastIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!currentUserId) return
    console.log('[MessageListenerProvider] Subscribing for user', currentUserId)
    // Message channel
    const channel = supabase
      .channel(`user:${currentUserId}:messages-global`)
      // User-specific subscription (original)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${currentUserId}` },
        (payload) => {
          console.log('[MessageListenerProvider] Received message event (filtered)', payload)
          const msg = payload.new
          if (!msg || !msg.body) return
          if (lastToastIdRef.current === msg.id) return
          lastToastIdRef.current = msg.id
          toast.custom((t) => (
            <div className="bg-[#041123] text-[#D4AF37] px-4 py-3 rounded-xl shadow-lg flex flex-col min-w-[180px] max-w-[320px]">
              <span className="font-bold text-xs mb-1">New message</span>
              <span className="text-xs whitespace-pre-wrap break-words">{msg.body}</span>
            </div>
          ), { id: msg.id })
        }
      )
      // Debug: subscribe to ALL INSERTs on messages table
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('[MessageListenerProvider][DEBUG] Received ANY INSERT event', payload)
        }
      )
      .subscribe()

    // Notification channel
    const notificationChannel = supabase
      .channel(`user:${currentUserId}:notifications`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${currentUserId}` },
        (payload) => {
          console.log('[MessageListenerProvider] Received notification event', payload)
          const notification = payload.new
          if (!notification || !notification.title) return
          toast.custom((t) => (
            <div
              className={`relative flex items-start gap-3 min-w-[220px] max-w-[360px] px-5 py-4 rounded-2xl shadow-2xl border-l-4 border-[#FFD700] bg-white/80 backdrop-blur-md text-[#1a1a1a] animate-fade-in-up`}
              style={{ boxShadow: '0 8px 32px 0 rgba(44, 44, 84, 0.18)' }}
            >
              {/* Bell Icon */}
              <span className="mt-1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-lg">
                  <path d="M18 16v-5a6 6 0 1 0-12 0v5l-1.5 2h15z" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <div className="flex-1">
                <span className="font-semibold text-sm text-[#1a1a1a] mb-1 block tracking-tight">
                  {notification.title || "New notification"}
                </span>
                {notification.body && (
                  <span className="text-xs text-[#444] whitespace-pre-wrap break-words leading-snug block">
                    {notification.body}
                  </span>
                )}
              </div>
              {/* Close button */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-[#FFD700]/20 transition"
                aria-label="Dismiss notification"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </svg>
              </button>
              <style jsx>{`
                .animate-fade-in-up {
                  animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1);
                }
                @keyframes fadeInUp {
                  0% {
                    opacity: 0;
                    transform: translateY(24px) scale(0.98);
                  }
                  100% {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
              `}</style>
            </div>
          ), { id: notification.id });
        }
      )
      .subscribe()

    return () => {
      console.log('[MessageListenerProvider] Unsubscribing for user', currentUserId)
      supabase.removeChannel(channel)
      supabase.removeChannel(notificationChannel)
    }
  }, [currentUserId])

  return <>{children}</>
}
