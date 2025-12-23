"use client"
import React, { useEffect, useRef, useState } from 'react'
import { format, isToday, isYesterday, differenceInCalendarDays } from 'date-fns'
import { supabase } from '../lib/supabaseClient'

interface OrderMessagesProps {
  orderId: string
  currentUserId: string
  otherUserId?: string
  otherUserName?: string
  currentUserLabel?: string
}

interface Message {
  id: string
  order_id: string
  sender_id: string
  recipient_id: string
  body: string | null
  image_url: string | null
  created_at: string
  delivered_at?: string | null
  read_at?: string | null
}

export default function OrderMessages({ orderId, currentUserId, otherUserId, otherUserName, currentUserLabel }: OrderMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [otherOnline, setOtherOnline] = useState<boolean | null>(null)
  const [otherTyping, setOtherTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const getTypingChannel = async () => {
    if (typingChannelRef.current) return typingChannelRef.current

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData?.session?.access_token
    if (!accessToken) {
      console.warn('[typing-send] no access token; cannot send typing broadcast')
      return null
    }

    await supabase.realtime.setAuth(accessToken)
    const topic = `order:${orderId}:typing`
    console.log('[typing-send] creating typing channel', topic)
    const channel = supabase.channel(topic, {
      config: { private: true, broadcast: { self: true } },
    })
    typingChannelRef.current = channel.subscribe()
    return typingChannelRef.current
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Error fetching messages:', error)
          return
        }

        setMessages(data || [])

        // Mark messages as read for this user/order and update per-message read_at
        const { data: sessionData } = await supabase.auth.getSession()
        const sessionUserId = sessionData?.session?.user?.id
        if (sessionUserId) {
          // Conversation-level read marker
          await supabase
            .from('message_reads')
            .upsert(
              {
                order_id: orderId,
                user_id: sessionUserId,
                last_read_at: new Date().toISOString()
              },
              { onConflict: 'order_id,user_id' }
            )

          // Per-message read marker for messages to this user on this order
          const { error: readError } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('order_id', orderId)
            .eq('recipient_id', sessionUserId)
            .is('read_at', null)

          if (readError) {
            console.warn('Failed to update message read_at', readError)
          } else {
            const nowIso = new Date().toISOString()
            setMessages(prev =>
              prev.map(m =>
                m.order_id === orderId &&
                m.recipient_id === sessionUserId &&
                !m.read_at
                  ? { ...m, read_at: nowIso }
                  : m
              )
            )
          }
        }
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchMessages()
    }
  }, [orderId])

  // Fetch and subscribe to other user's presence directly from user_presence
  useEffect(() => {
    if (!otherUserId) return

    const fetchPresence = async () => {
      const { data, error } = await supabase
        .from('user_presence')
        .select('last_seen_at')
        .eq('user_id', otherUserId)
        .maybeSingle()

      if (error) {
        setOtherOnline(false)
        return
      }

      if (!data?.last_seen_at) {
        setOtherOnline(false)
        return
      }

      const lastSeen = new Date(data.last_seen_at).getTime()
      const now = Date.now()
      const diffSeconds = (now - lastSeen) / 1000
      setOtherOnline(diffSeconds < 60)
    }

    fetchPresence()

    const channel = supabase
      .channel(`presence-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_presence',
          filter: `user_id=eq.${otherUserId}`
        },
        (payload) => {
          const row = payload.new as any
          const lastSeenIso = row?.last_seen_at
          if (!lastSeenIso) {
            return
          }
          const lastSeen = new Date(lastSeenIso).getTime()
          const now = Date.now()
          const diffSeconds = (now - lastSeen) / 1000
          setOtherOnline(diffSeconds < 60)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [otherUserId])

  useEffect(() => {
    if (!orderId) return

    const setup = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token
      if (!accessToken) {
        return null
      }

      await supabase.realtime.setAuth(accessToken)

      const topic = `order:${orderId}:messages`

      const messageChannel = supabase
        .channel(topic, { config: { private: true, broadcast: { self: true, ack: true } } })
        .on('broadcast', { event: 'INSERT' }, (payload: any) => {
          // broadcast_changes sends a change envelope in payload.payload
          const container = payload?.payload
          const row = container?.record as Partial<Message> | undefined
          if (!row) {
            return
          }

          if (!row.id || !row.sender_id || !row.recipient_id || !row.created_at) {
            return
          }

          const newMsg = row as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) {
              return prev
            }
            return [...prev, newMsg]
          })
        })
        .on('broadcast', { event: 'UPDATE' }, (payload: any) => {
          const container = payload?.payload
          const row = container?.record as Partial<Message> | undefined
          if (!row || !row.id) {
            return
          }

          setMessages(prev =>
            prev.map(m =>
              m.id === row.id
                ? {
                    ...m,
                    // Only override fields we care about for read receipts
                    delivered_at: row.delivered_at ?? m.delivered_at,
                    read_at: row.read_at ?? m.read_at,
                  }
                : m
            )
          )
        })
        .subscribe()

      return messageChannel
    }

    let messageChannel: ReturnType<typeof supabase.channel> | null = null

    setup().then(ch => {
      messageChannel = ch
    })

    return () => {
      if (messageChannel) {
        supabase.removeChannel(messageChannel)
      }
    }
  }, [orderId])

  // Subscribe to other user's typing state for this order via Realtime broadcast
  useEffect(() => {
    if (!orderId || !otherUserId) return

    const setup = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const accessToken = sessionData?.session?.access_token
        if (!accessToken) {
          return
        }

        await supabase.realtime.setAuth(accessToken)

        const topic = `order:${orderId}:typing`

        const channel = supabase
          .channel(topic, { config: { private: true, broadcast: { self: true } } })
          .on('broadcast', { event: 'typing_changed' }, ({ payload }) => {
            const { user_id, is_typing } = payload as any
            if (!user_id) return
            if (user_id !== otherUserId) return
            setOtherTyping(!!is_typing)
          })
          .subscribe()

        return channel
      } catch (err) {
        return undefined
      }
    }

    let activeChannel: ReturnType<typeof supabase.channel> | undefined

    setup().then((channel) => {
      activeChannel = channel
    })

    return () => {
      if (activeChannel) {
        console.log('[typing-sub] removing broadcast subscription', { topic: activeChannel.topic })
        supabase.removeChannel(activeChannel)
      }
    }
  }, [orderId, otherUserId])

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      setSending(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUserId = sessionData?.session?.user?.id
      if (!sessionUserId) {
        alert('You must be signed in to send messages.')
        return
      }

      const recipientId = otherUserId || sessionUserId

      const { data, error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: sessionUserId,
          recipient_id: recipientId,
          body: newMessage.trim()
        })
        .select('*')
        .single()

      if (error) {
        console.error('Error sending message:', error)
        alert(error.message || 'Failed to send message')
        return
      }

      const inserted = data as Message

      // Create a notification for the recipient about this new message
      try {
        const preview = inserted.body?.slice(0, 80) || 'New message on your order'
        await supabase.from('notifications').insert({
          user_id: recipientId,
          title: 'New message on your order',
          body: preview,
          type: 'message',
          order_id: orderId
        })
      } catch (notifyError) {
        console.warn('Failed to create message notification', notifyError)
      }

      setNewMessage('')

      // Reset typing state on send
      setIsTyping(false)
      await supabase
        .from('message_typing')
        .upsert(
          {
            order_id: orderId,
            user_id: sessionUserId,
            is_typing: false,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'order_id,user_id' }
        )
    } finally {
      setSending(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const sessionUserId = sessionData?.session?.user?.id
      if (!sessionUserId) {
        alert('You must be signed in to send images.')
        return
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${orderId}/${sessionUserId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('messages')
        .upload(filePath, file, { upsert: false })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        alert(uploadError.message || 'Failed to upload image')
        return
      }

      const { data: urlData } = supabase.storage
        .from('messages')
        .getPublicUrl(filePath)

      const imageUrl = urlData.publicUrl
      const recipientId = otherUserId || sessionUserId

      const { data, error } = await supabase
        .from('messages')
        .insert({
          order_id: orderId,
          sender_id: sessionUserId,
          recipient_id: recipientId,
          image_url: imageUrl,
          body: newMessage.trim() || null
        })
        .select('*')
        .single()

      if (error) {
        console.error('Error sending image message:', error)
        alert(error.message || 'Failed to send image message')
        return
      }

      const inserted = data as Message

      // Create a notification for the recipient about this new image message
      try {
        const preview = inserted.body?.slice(0, 80) || 'New image message on your order'
        await supabase.from('notifications').insert({
          user_id: recipientId,
          title: 'New message on your order',
          body: preview,
          type: 'message',
          order_id: orderId
        })
      } catch (notifyError) {
        console.warn('Failed to create image message notification', notifyError)
      }

      setNewMessage('')
      e.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewMessage(value)

    const { data: sessionData } = await supabase.auth.getSession()
    const sessionUserId = sessionData?.session?.user?.id
    if (!sessionUserId) return

    // Always mark as typing on keypress
    setIsTyping(true)
    await supabase
      .from('message_typing')
      .upsert(
        {
          order_id: orderId,
          user_id: sessionUserId,
          is_typing: true,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'order_id,user_id' }
      )

    const typingChannel = await getTypingChannel()
    if (typingChannel) {
      typingChannel.send({
        type: 'broadcast',
        event: 'typing_changed',
        payload: { user_id: sessionUserId, is_typing: true },
      })
    }

    // Debounce stop-typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(async () => {
      setIsTyping(false)
      await supabase
        .from('message_typing')
        .upsert(
          {
            order_id: orderId,
            user_id: sessionUserId,
            is_typing: false,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'order_id,user_id' }
        )

      const typingChannel2 = await getTypingChannel()
      if (typingChannel2) {
        typingChannel2.send({
          type: 'broadcast',
          event: 'typing_changed',
          payload: { user_id: sessionUserId, is_typing: false },
        })
      }
    }, 2000)
  }

  return (
    <div className="bg-[#010812]/50 border border-[#D4AF37]/20 rounded-2xl p-4 sm:p-5 flex flex-col h-80">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#D4AF37]">Messages</h3>
          {otherUserId && (
            <div className="flex flex-col mt-1">
              <div className="flex items-center gap-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    otherOnline ? 'bg-[#4ade80]' : 'bg-[#64748b]'
                  }`}
                />
                <span className="text-[11px] text-[#C6CDD1]/70">
                  {otherOnline === null
                    ? 'Checking status...'
                    : otherOnline
                    ? 'Online'
                    : 'Offline'}
                </span>
              </div>
              {otherTyping && (
                <span className="text-[11px] text-[#D4AF37]/80 mt-0.5">
                  Typing...
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <p className="text-xs text-[#C6CDD1]/60">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-[#C6CDD1]/60">No messages yet. Start the conversation below.</p>
        ) : (
          (() => {
            const items: React.ReactNode[] = []
            let lastDateLabel: string | null = null
            messages.forEach((msg, idx) => {
              if (!msg || !msg.sender_id) {
                console.warn('[msg-render] skipping invalid message row', msg)
                return
              }
              const msgDate = new Date(msg.created_at)
              let dateLabel = ''
              if (isToday(msgDate)) {
                dateLabel = 'Today'
              } else if (isYesterday(msgDate)) {
                dateLabel = 'Yesterday'
              } else {
                const daysAgo = differenceInCalendarDays(new Date(), msgDate)
                if (daysAgo < 7) {
                  // Show day of week for last 7 days (excluding today/yesterday)
                  dateLabel = format(msgDate, 'EEEE') // Monday, Tuesday, etc.
                } else {
                  // Show as Tue 16 Dec, Mon 15 Dec, etc.
                  dateLabel = format(msgDate, 'EEE d MMM')
                }
              }
              if (dateLabel !== lastDateLabel) {
                items.push(
                  <div key={`date-sep-${dateLabel}-${idx}`} className="flex justify-center my-2">
                    <span className="px-3 py-1 rounded-full bg-[#041123]/60 text-[#D4AF37] text-xs font-semibold shadow">{dateLabel}</span>
                  </div>
                )
                lastDateLabel = dateLabel
              }
              const isMine = msg.sender_id === currentUserId
              const mineLabel = currentUserLabel || 'You'
              const otherLabel = otherUserName || 'Advisor'
              items.push(
                <div
                  key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs sm:text-sm ${
                      isMine
                        ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123]'
                        : 'bg-[#041123]/80 text-[#C6CDD1] border border-[#D4AF37]/10'
                    }`}
                  >
                    {msg.image_url && (
                      <a
                        href={msg.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="block mb-1"
                      >
                        <img
                          src={msg.image_url}
                          alt="Shared vehicle"
                          className="max-h-40 rounded-xl border border-[#D4AF37]/20 object-cover"
                        />
                      </a>
                    )}
                    {msg.body && (
                      <p className="whitespace-pre-wrap break-words mb-1">{msg.body}</p>
                    )}
                    <div className="flex justify-between items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold ${isMine ? 'text-[#041123]/80' : 'text-[#D4AF37]/80'}`}>
                        {isMine ? mineLabel : otherLabel}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`text-[10px] ${isMine ? 'text-[#041123]/70' : 'text-[#C6CDD1]/50'}`}>
                          {msgDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMine && (
                          <span className="text-[11px]">
                            {msg.read_at
                              ? <span className="text-[#1D9BF0]">✓✓</span>
                              : msg.delivered_at
                              ? <span className="text-[#041123]/80">✓✓</span>
                              : <span className="text-[#041123]/80">✓</span>
                            }
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
            return items
          })()
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="mt-3 flex items-center gap-2">
        <label className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#010812]/70 border border-[#D4AF37]/20 text-[#D4AF37] text-xs cursor-pointer hover:bg-[#010812]/90">
          <span>{uploading ? '…' : '📷'}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={uploading}
          />
        </label>
        <input
          type="text"
          value={newMessage}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-xl bg-[#010812]/70 border border-[#D4AF37]/20 text-xs sm:text-sm text-[#C6CDD1] placeholder:text-[#C6CDD1]/40 focus:outline-none focus:border-[#D4AF37]"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
