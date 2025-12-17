"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Footer from './Footer'

interface Order {
  id: string
  user_id: string
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
  first_name?: string
  last_name?: string
  phone?: string
  status: 'pending' | 'in-progress' | 'completed'
  created_at: string
  deleted_at?: string | null
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  totalRevenue: string
  newOrdersToday: number
  cancelledOrders: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'analytics' | 'settings'>('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalRevenue: '$0',
    newOrdersToday: 0,
    cancelledOrders: 0
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [includeCancelled, setIncludeCancelled] = useState(false)
  const [showOnlyCancelled, setShowOnlyCancelled] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData()
    }
  }, [isAdmin, includeCancelled])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter, showOnlyCancelled])

  const checkAdminAccess = async () => {
    try {
      setCheckingAuth(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/signin?redirect=/admin')
        return
      }

      // Check if user email is in admin list
      const adminEmails = [
        'admin@bkauto.com',
        'r.aduboffour@gmail.com',
        // Add more admin emails here
      ]

      const userEmail = session.user.email
      
      // Check if user has admin role in metadata
      const isAdminUser = session.user.user_metadata?.role === 'admin' || 
                         adminEmails.includes(userEmail || '')

      if (!isAdminUser) {
        // Not an admin, redirect to user dashboard
        router.push('/dashboard')
        return
      }

      setIsAdmin(true)
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/signin?redirect=/admin')
    } finally {
      setCheckingAuth(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch all orders with user data
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (ordersError) {
        console.error('Error fetching orders:', ordersError)
        setLoading(false)
        return
      }

      console.log('Fetched orders:', ordersData)
      
      // Filter out any orders with null/undefined status and log them
      const baseOrders = (ordersData || []).filter(order => {
        if (!order.status) {
          console.warn('Order has no status:', order.id, order)
          return false
        }
        return true
      })
      const visibleOrders = includeCancelled ? baseOrders : baseOrders.filter(o => !o.deleted_at)

      console.log(`Total orders: ${ordersData?.length}, Visible orders: ${visibleOrders.length}`)
      // Orders already have contact info (first_name, last_name, phone)
      setOrders(visibleOrders as Order[])

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const activeOrders = (ordersData || []).filter((o: any) => !o.deleted_at)
      const cancelledOrders = (ordersData || []).filter((o: any) => o.deleted_at).length
      const pendingCount = activeOrders.filter(o => o.status === 'pending').length
      const inProgressCount = activeOrders.filter(o => o.status === 'in-progress').length
      const completedCount = activeOrders.filter(o => o.status === 'completed').length
      const newToday = activeOrders.filter(o => new Date(o.created_at) >= today).length

      setStats({
        totalOrders: activeOrders.length,
        pendingOrders: pendingCount,
        inProgressOrders: inProgressCount,
        completedOrders: completedCount,
        totalRevenue: '$0', // TODO: Calculate from budget field
        newOrdersToday: newToday,
        cancelledOrders
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // If showing only cancelled, ignore status filter and keep only soft-deleted
    if (showOnlyCancelled) {
      filtered = filtered.filter(order => order.deleted_at)
    } else if (statusFilter !== 'all') {
      // Status filter for active orders
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.make?.toLowerCase().includes(query) ||
        order.model?.toLowerCase().includes(query) ||
        order.first_name?.toLowerCase().includes(query) ||
        order.last_name?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      )
    }

    setFilteredOrders(filtered)
  }

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      console.error('Error updating order:', error)
      return
    }

    // Notify order owner about status change
    try {
      const targetOrder = orders.find(o => o.id === orderId)
      if (targetOrder) {
        const title = newStatus === 'pending' ? 'Order Pending'
                      : newStatus === 'in-progress' ? 'Order In Progress'
                      : 'Order Completed'
        const body = newStatus === 'pending'
          ? 'Your order has been received and is pending.'
          : newStatus === 'in-progress'
          ? 'We are now sourcing your vehicle. Stay tuned!'
          : 'Your order has been completed. Thank you!'

        await supabase
          .from('notifications')
          .insert({
            user_id: targetOrder.user_id,
            title,
            body,
            type: newStatus === 'completed' ? 'success' : 'info'
          })
      }
    } catch (e) {
      console.warn('Notification insert failed on status update', e)
    }

    // Refresh data
    fetchDashboardData()
    setShowOrderDetail(false)
  }

  const statusColors = {
    'pending': { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
    'in-progress': { bg: 'bg-[#6B667A]/10', text: 'text-[#6B667A]', border: 'border-[#6B667A]/30', glow: 'shadow-[0_0_20px_rgba(18,87,216,0.3)]' },
    'completed': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  const cancelOrderAsAdmin = async (order: Order) => {
    if (!order || !order.id) return
    const confirmed = window.confirm(`Cancel order #${order.id.slice(0, 8).toUpperCase()} for this user?`)
    if (!confirmed) return
    try {
      setActionLoading(true)
      const { error } = await supabase
        .from('orders')
        .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', order.id)

      if (error) {
        console.error('Error cancelling order as admin:', error)
        alert(`Failed to cancel order: ${error.message || 'Unknown error'}`)
      } else {
        alert(`Order #${order.id.slice(0, 8).toUpperCase()} has been cancelled.`)
        await fetchDashboardData()
        setShowOrderDetail(false)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const deleteOrderPermanently = async (order: Order) => {
    if (!order || !order.id) return
    const confirmed = window.confirm(`Permanently delete order #${order.id.slice(0, 8).toUpperCase()}? This cannot be undone and will remove it from all views.`)
    if (!confirmed) return
    try {
      setActionLoading(true)
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', order.id)

      if (error) {
        console.error('Error deleting order as admin:', error)
        alert(`Failed to delete order: ${error.message || 'Unknown error'}`)
      } else {
        alert(`Order #${order.id.slice(0, 8).toUpperCase()} has been permanently deleted.`)
        await fetchDashboardData()
        setShowOrderDetail(false)
      }
    } finally {
      setActionLoading(false)
    }
  }

  const toggleBlockUser = async (order: Order) => {
    if (!order || !order.user_id) return
    const shortId = order.id.slice(0, 8).toUpperCase()
    const confirmed = window.confirm(`Block this user from placing new orders? (Order #${shortId})`)
    if (!confirmed) return
    try {
      setActionLoading(true)
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_blocked: true, updated_at: new Date().toISOString() })
        .eq('user_id', order.user_id)

      if (error) {
        console.error('Error blocking user:', error)
        alert(`Failed to block user: ${error.message || 'Unknown error'}`)
      } else {
        alert('User has been blocked from placing new orders.')
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Show loading while checking authentication
  if (checkingAuth) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#010812] via-[#041123] to-[#0a1b2e] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#D4AF37] font-semibold">Verifying Admin Access...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if not admin (will redirect)
  if (!isAdmin) {
    return null
  }

  return (
    <div className="w-full min-h-screen bg-[#6B667A] pt-20 md:pt-0">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-r from-[#D4AF37] to-[#FFE17B]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl bg-gradient-to-r from-[#FFFFFF] to-[#10B981]"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl bg-gradient-to-r from-[#E11D48] to-[#F59E0B]"></div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#D4AF37] font-semibold">Loading Admin Dashboard...</p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Premium Header */}
        <div className="bg-gradient-to-r from-[#041123]/80 via-[#041123]/90 to-[#041123]/80 backdrop-blur-xl border-b border-[#D4AF37]/20 sticky top-0 z-50">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            {/* Top Row - Logo, Title, Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] blur-xl opacity-50"></div>
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFE17B] flex items-center justify-center shadow-2xl">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#041123]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.91-.96-7-5.21-7-9.5V8.3l7-3.11 7 3.11v2.2c0 4.29-3.09 8.54-7 9.5z"/>
                    </svg>
                  </div>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE17B] to-[#D4AF37] truncate">
                    Admin Control Center
                  </h1>
                  <p className="text-xs sm:text-sm text-[#C6CDD1]/60 mt-1 hidden sm:block">BK Auto Trading • Premium Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap flex-shrink-0">
                <div className="hidden md:block px-3 py-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30">
                  <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Admin Access</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="hidden md:block px-4 py-2 rounded-xl bg-[#041123]/50 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all text-sm font-medium"
                >
                  User View
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-3 sm:px-4 py-2 rounded-xl bg-[#E11D48]/10 border border-[#E11D48]/30 text-[#E11D48] hover:bg-[#E11D48]/20 transition-all flex items-center gap-1 sm:gap-2 text-sm font-medium whitespace-nowrap"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>

            {/* Tab Navigation - Scrollable on mobile */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'orders', label: 'Orders', icon: '🚗' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all whitespace-nowrap flex-shrink-0 text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] shadow-lg shadow-[#D4AF37]/30'
                      : 'bg-[#041123]/30 text-[#C6CDD1] border border-[#6B667A]/20 hover:bg-[#041123]/50'
                  }`}
                >
                  <span className="mr-1 sm:mr-2 text-base sm:text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-6">
                {[
                  { key: 'total', label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'from-[#D4AF37] to-[#FFE17B]' },
                  { key: 'pending', label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: 'from-[#F59E0B] to-[#FCD34D]' },
                  { key: 'inProgress', label: 'In Progress', value: stats.inProgressOrders, icon: '🔄', color: 'from-[#6B667A] to-[#60A5FA]' },
                  { key: 'completed', label: 'Completed', value: stats.completedOrders, icon: '✅', color: 'from-[#10B981] to-[#34D399]' },
                  { key: 'newToday', label: 'New Today', value: stats.newOrdersToday, icon: '🆕', color: 'from-[#E11D48] to-[#FB7185]' },
                  { key: 'revenue', label: 'Revenue', value: stats.totalRevenue, icon: '💰', color: 'from-[#8B5CF6] to-[#A78BFA]' },
                  { key: 'cancelled', label: 'Cancelled', value: stats.cancelledOrders, icon: '🚫', color: 'from-[#4B5563] to-[#9CA3AF]' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl" style={{ background: `linear-gradient(to right, ${stat.color.split(' ')[0].replace('from-', '')}, ${stat.color.split(' ')[1].replace('to-', '')})` }}></div>
                    <button
                      type="button"
                      onClick={() => {
                        if (stat.key === 'cancelled') {
                          setActiveTab('orders')
                          setIncludeCancelled(true)
                          setShowOnlyCancelled(true)
                          setStatusFilter('all')
                          setSearchQuery('')
                        }
                      }}
                      className="relative w-full text-left bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-3xl font-black text-[#D4AF37] mb-1">{stat.value}</p>
                      <p className="text-sm text-[#C6CDD1]/60 font-medium">{stat.label}</p>
                    </button>
                  </div>
                ))}
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#D4AF37]">Recent Orders</h2>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] font-semibold hover:shadow-lg transition-all"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#010812]/50 border border-[#6B667A]/20 hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowOrderDetail(true)
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#6B667A]/20 border border-[#D4AF37]/30 flex items-center justify-center">
                          <span className="text-xl">🚗</span>
                        </div>
                        <div>
                          <p className="text-[#D4AF37] font-semibold">{order.make} {order.model} {order.year}</p>
                          <p className="text-xs text-[#C6CDD1]/60">{order.first_name} {order.last_name} • {new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[order.status].bg} ${statusColors[order.status].text} border ${statusColors[order.status].border}`}>
                          {order.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Search by vehicle, customer, or order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#010812]/50 border border-[#D4AF37]/20 text-[#C6CDD1] placeholder-[#C6CDD1]/40 focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={showOnlyCancelled}
                          onClick={() => !showOnlyCancelled && setStatusFilter(status)}
                          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                            showOnlyCancelled
                              ? 'bg-[#010812]/30 text-[#6B667A] border border-[#6B667A]/30 cursor-not-allowed'
                              : statusFilter === status
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123]'
                                : 'bg-[#010812]/50 text-[#C6CDD1] border border-[#6B667A]/20 hover:bg-[#010812]/80'
                          }`}
                        >
                          {status === 'all' ? 'All' : status.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-[#C6CDD1]/70">
                        <input
                          type="checkbox"
                          checked={includeCancelled}
                          onChange={(e) => setIncludeCancelled(e.target.checked)}
                          className="w-4 h-4 rounded border-[#D4AF37]/40 bg-[#010812]"
                        />
                        <span>Include cancelled orders</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs sm:text-sm text-[#C6CDD1]/70">
                        <input
                          type="checkbox"
                          checked={showOnlyCancelled}
                          onChange={(e) => setShowOnlyCancelled(e.target.checked)}
                          className="w-4 h-4 rounded border-[#D4AF37]/40 bg-[#010812]"
                        />
                        <span>Show only cancelled</span>
                      </label>
                      {showOnlyCancelled && (
                        <span className="text-[11px] sm:text-xs text-[#F59E0B]/80">
                          Status filters are disabled while showing only cancelled orders.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#D4AF37]/20">
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-[#D4AF37] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className={`border-b border-[#6B667A]/20 hover:bg-[#010812]/30 transition-colors ${order.deleted_at ? 'opacity-60' : ''}`}
                        >
                          <td className="px-6 py-4 text-sm text-[#C6CDD1] font-mono">#{order.id.slice(0, 8)}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-[#D4AF37] font-semibold">{order.first_name} {order.last_name}</p>
                              <p className="text-xs text-[#C6CDD1]/60">{order.phone}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-[#C6CDD1]">{order.make} {order.model}</p>
                            <p className="text-xs text-[#C6CDD1]/60">{order.year} • {order.color}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#C6CDD1]">{order.budget}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              order.priority === 'high' ? 'bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/30' :
                              order.priority === 'medium' ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30' :
                              'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30'
                            }`}>
                              {order.priority}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[order.status]?.bg || 'bg-gray-500/10'} ${statusColors[order.status]?.text || 'text-gray-500'} border ${statusColors[order.status]?.border || 'border-gray-500/30'}`}>
                              {order.deleted_at ? 'CANCELLED' : (order.status || 'unknown').replace('-', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[#C6CDD1]/60">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowOrderDetail(true)
                              }}
                              className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] text-xs font-semibold hover:shadow-lg transition-all"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Analytics Coming Soon</h3>
                <p className="text-[#C6CDD1]/60">Advanced analytics and reporting features will be available here.</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-2xl font-bold text-[#D4AF37] mb-2">Settings</h3>
                <p className="text-[#C6CDD1]/60">Admin settings and configuration options will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-[#041123] to-[#010812] border border-[#D4AF37]/30 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFE17B]">Order Details</h2>
                <p className="text-sm text-[#C6CDD1]/60 mt-1">Order ID: #{selectedOrder.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => setShowOrderDetail(false)}
                className="p-2 rounded-xl bg-[#041123]/50 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-[#010812]/50 border border-[#D4AF37]/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Name</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#C6CDD1]/60 mb-1">Phone</p>
                      <p className="text-sm text-[#C6CDD1]">{selectedOrder.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/40">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-[#010812]/50 border border-[#D4AF37]/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Type</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.vehicle_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Make & Model</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.make} {selectedOrder.model}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Year</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Color</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.color}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Condition</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.condition}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Budget</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.budget}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-[#010812]/50 border border-[#D4AF37]/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Priority</p>
                    <p className="text-sm text-[#C6CDD1] capitalize">{selectedOrder.priority}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Timeline</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.timeline}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Notes</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.notes || 'No notes provided'}</p>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-[#010812]/50 border border-[#D4AF37]/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[#D4AF37] mb-4">Update Status</h3>
                <div className="flex gap-3">
                  {(['pending', 'in-progress', 'completed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => updateOrderStatus(selectedOrder.id, status)}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                        selectedOrder.status === status
                          ? `${statusColors[status].bg} ${statusColors[status].text} border ${statusColors[status].border} ${statusColors[status].glow}`
                          : 'bg-[#041123]/50 text-[#C6CDD1] border border-[#6B667A]/20 hover:bg-[#041123]/80'
                      }`}
                    >
                      {status.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={actionLoading || !!selectedOrder.deleted_at}
                    onClick={() => cancelOrderAsAdmin(selectedOrder)}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all text-sm ${
                      selectedOrder.deleted_at
                        ? 'bg-[#010812]/40 text-[#6B667A] border border-[#6B667A]/40 cursor-not-allowed'
                        : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/20'
                    }`}
                  >
                    {selectedOrder.deleted_at ? 'Order Cancelled' : actionLoading ? 'Cancelling...' : 'Cancel Order (Soft Delete)'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => deleteOrderPermanently(selectedOrder)}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all text-sm bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/40 hover:bg-[#E11D48]/20"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => toggleBlockUser(selectedOrder)}
                    className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all text-sm bg-[#6B667A]/10 text-[#E5E7EB] border border-[#6B667A]/40 hover:bg-[#6B667A]/30"
                  >
                    {actionLoading ? 'Applying...' : 'Block User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

