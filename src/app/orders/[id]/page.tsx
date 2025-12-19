"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabaseClient'
import OrderMessages from '../../../components/OrderMessages'

interface Order {
  id: string
  first_name?: string
  vehicle_type: string
  make: string
  model: string
  year: number
  color: string
  condition: string
  budget: string
  priority: string
  timeline: string
  notes: string
  status: 'pending' | 'in-progress' | 'completed'
  created_at: string
  advisor_user_id?: string | null
}

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params?.id as string | undefined

  const [order, setOrder] = useState<Order | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          router.push('/signin?redirect=/orders')
          return
        }
        setUserId(session.user.id)

        if (!orderId) {
          setError('Missing order id')
          return
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', session.user.id)
          .single()

        if (error) {
          setError(error.message || 'Could not load order')
          return
        }

        setOrder(data as Order)
      } catch (e: any) {
        setError(e?.message || 'Unexpected error loading order')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [orderId, router])

  const statusLabel = (status: Order['status']) =>
    (status || 'pending').replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())

  const shortId = order?.id?.slice(0, 8)?.toUpperCase()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#010812] via-[#041123] to-[#0a1b2e] pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-[#C6CDD1]/60 tracking-[0.2em] uppercase mb-2">Order Details</p>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE17B] to-[#D4AF37]">
              {order ? `Order #${shortId}` : 'Order'}
            </h1>
          </div>
          <button
            onClick={() => router.push('/orders')}
            className="px-4 py-2 rounded-xl bg-[#041123]/70 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/10 transition-all"
          >
            Back to My Orders
          </button>
        </div>

        {loading && (
          <div className="mt-20 text-center text-[#C6CDD1]/70 text-sm">Loading order details...</div>
        )}

        {!loading && error && (
          <div className="mt-10 text-center text-sm text-[#FFC7C7] bg-[#3a1b1b]/40 border border-[#E11D48]/30 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {!loading && order && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Order details */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#041123]/70 border border-[#D4AF37]/20 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Vehicle</p>
                    <p className="text-lg font-semibold text-[#D4AF37]">
                      {order.make} {order.model} {order.year}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold border border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10">
                    {statusLabel(order.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm text-[#C6CDD1]/80">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#C6CDD1]/50 mb-1">Vehicle Type</p>
                    <p>{order.vehicle_type}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#C6CDD1]/50 mb-1">Color</p>
                    <p>{order.color}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#C6CDD1]/50 mb-1">Condition</p>
                    <p className="capitalize">{order.condition}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#C6CDD1]/50 mb-1">Budget</p>
                    <p className="font-semibold text-[#D4AF37]">{order.budget || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#C6CDD1]/50 mb-1">Priority</p>
                    <p className="capitalize">{order.priority}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-[#C6CDD1]/50 mb-1">Timeline</p>
                    <p>{order.timeline}</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#041123]/70 border border-[#D4AF37]/20 rounded-3xl p-6">
                <p className="text-xs font-semibold text-[#C6CDD1]/60 tracking-[0.2em] uppercase mb-2">Your Request</p>
                <p className="text-sm text-[#C6CDD1]/80 whitespace-pre-wrap">
                  {order.notes || 'No additional notes provided for this order.'}
                </p>
              </div>

              <div className="bg-[#041123]/70 border border-[#D4AF37]/20 rounded-3xl p-6">
                <p className="text-xs font-semibold text-[#C6CDD1]/60 tracking-[0.2em] uppercase mb-3">Order Timeline</p>
                <div className="flex items-center justify-between text-xs text-[#C6CDD1]/60">
                  <div className="flex flex-col items-start">
                    <span className="mb-1 text-[11px] uppercase tracking-wide">Placed</span>
                    <span className="text-[11px]">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex-1 mx-4 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#6B667A] to-[#10B981] opacity-60 rounded-full"></div>
                  <div className="flex flex-col items-end">
                    <span className="mb-1 text-[11px] uppercase tracking-wide">Status</span>
                    <span className="text-[11px]">{statusLabel(order.status)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live chat */}
            <div className="lg:col-span-2">
              <div className="bg-[#041123]/80 border border-[#D4AF37]/25 rounded-3xl p-4 sm:p-5 shadow-xl sticky top-24">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-[#C6CDD1]/60 tracking-[0.2em] uppercase">Live Conversation</p>
                    <p className="text-xs text-[#C6CDD1]/60">Chat with your BK Auto advisor about this order.</p>
                  </div>
                </div>
                {userId && (
                  <OrderMessages
                    orderId={order.id}
                    currentUserId={userId}
                    otherUserId={order.advisor_user_id || undefined}
                    otherUserName="Advisor"
                    currentUserLabel="You"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
