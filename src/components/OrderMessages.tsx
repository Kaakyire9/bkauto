"use client"
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface OrderMessagesProps {
  orderId: string
  currentUserId: string
  otherUserId?: string
}

interface Message {
  id: string
  order_id: string
  sender_id: string
  recipient_id: string
  body: string | null
  image_url: string | null
  created_at: string
}

export default function OrderMessages({ orderId, currentUserId, otherUserId }: OrderMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const [uploading, setUploading] = useState(false)

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
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchMessages()
    }
  }, [orderId])

  useEffect(() => {
    if (!orderId) return

    const channel = supabase
      .channel(`messages-order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `order_id=eq.${orderId}`
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages(prev => [...prev, newMsg])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

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

      setMessages(prev => [...prev, data as Message])
      setNewMessage('')
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

      setMessages(prev => [...prev, data as Message])
      setNewMessage('')
      e.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-[#010812]/50 border border-[#D4AF37]/20 rounded-2xl p-4 sm:p-5 flex flex-col h-80">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[#D4AF37]">Messages</h3>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <p className="text-xs text-[#C6CDD1]/60">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-[#C6CDD1]/60">No messages yet. Start the conversation below.</p>
        ) : (
          messages.map(msg => {
            const isMine = msg.sender_id === currentUserId
            return (
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
                      {isMine ? 'You' : 'Advisor'}
                    </span>
                    <span className={`text-[10px] ${isMine ? 'text-[#041123]/70' : 'text-[#C6CDD1]/50'}`}>
                      {new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })
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
          onChange={(e) => setNewMessage(e.target.value)}
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
