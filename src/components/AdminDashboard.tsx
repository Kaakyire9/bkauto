"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

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
  status: 'pending' | 'in-progress' | 'completed'
  created_at: string
  user_email?: string
  user_name?: string
}

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  totalRevenue: string
  newOrdersToday: number
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
    newOrdersToday: 0
  })
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  useEffect(() => {
    checkAdminAccess()
    fetchDashboardData()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, searchQuery, statusFilter])

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signin')
      return
    }
    // TODO: Add admin role check here
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

      // Fetch user emails for each order
      const ordersWithUserData = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)
          return {
            ...order,
            user_email: userData?.user?.email || 'Unknown',
            user_name: userData?.user?.user_metadata?.full_name || 'Unknown User'
          }
        })
      )

      setOrders(ordersWithUserData)

      // Calculate stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const pendingCount = ordersWithUserData.filter(o => o.status === 'pending').length
      const inProgressCount = ordersWithUserData.filter(o => o.status === 'in-progress').length
      const completedCount = ordersWithUserData.filter(o => o.status === 'completed').length
      const newToday = ordersWithUserData.filter(o => new Date(o.created_at) >= today).length

      setStats({
        totalOrders: ordersWithUserData.length,
        pendingOrders: pendingCount,
        inProgressOrders: inProgressCount,
        completedOrders: completedCount,
        totalRevenue: '$0', // TODO: Calculate from budget field
        newOrdersToday: newToday
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.make?.toLowerCase().includes(query) ||
        order.model?.toLowerCase().includes(query) ||
        order.user_email?.toLowerCase().includes(query) ||
        order.user_name?.toLowerCase().includes(query) ||
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

    // Refresh data
    fetchDashboardData()
    setShowOrderDetail(false)
  }

  const statusColors = {
    'pending': { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' },
    'in-progress': { bg: 'bg-[#1257D8]/10', text: 'text-[#1257D8]', border: 'border-[#1257D8]/30', glow: 'shadow-[0_0_20px_rgba(18,87,216,0.3)]' },
    'completed': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]' }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#010812] via-[#041123] to-[#0a1b2e]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl bg-gradient-to-r from-[#D4AF37] to-[#FFE17B]"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15 blur-3xl bg-gradient-to-r from-[#1257D8] to-[#10B981]"></div>
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
          <div className="max-w-[1800px] mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] blur-xl opacity-50"></div>
                  <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#FFE17B] flex items-center justify-center shadow-2xl">
                    <svg className="w-8 h-8 text-[#041123]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.91-.96-7-5.21-7-9.5V8.3l7-3.11 7 3.11v2.2c0 4.29-3.09 8.54-7 9.5z"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE17B] to-[#D4AF37]">
                    Admin Control Center
                  </h1>
                  <p className="text-sm text-[#C6CDD1]/60 mt-1">BK Auto Trading • Premium Dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30">
                  <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">Admin Access</span>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 rounded-xl bg-[#041123]/50 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all"
                >
                  User View
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-6">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'orders', label: 'Orders', icon: '🚗' },
                { id: 'analytics', label: 'Analytics', icon: '📈' },
                { id: 'settings', label: 'Settings', icon: '⚙️' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123] shadow-lg shadow-[#D4AF37]/30'
                      : 'bg-[#041123]/30 text-[#C6CDD1] border border-[#D4AF37]/10 hover:bg-[#041123]/50'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1800px] mx-auto px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {[
                  { label: 'Total Orders', value: stats.totalOrders, icon: '📦', color: 'from-[#D4AF37] to-[#FFE17B]' },
                  { label: 'Pending', value: stats.pendingOrders, icon: '⏳', color: 'from-[#F59E0B] to-[#FCD34D]' },
                  { label: 'In Progress', value: stats.inProgressOrders, icon: '🔄', color: 'from-[#1257D8] to-[#60A5FA]' },
                  { label: 'Completed', value: stats.completedOrders, icon: '✅', color: 'from-[#10B981] to-[#34D399]' },
                  { label: 'New Today', value: stats.newOrdersToday, icon: '🆕', color: 'from-[#E11D48] to-[#FB7185]' },
                  { label: 'Revenue', value: stats.totalRevenue, icon: '💰', color: 'from-[#8B5CF6] to-[#A78BFA]' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity blur-xl" style={{ background: `linear-gradient(to right, ${stat.color.split(' ')[0].replace('from-', '')}, ${stat.color.split(' ')[1].replace('to-', '')})` }}></div>
                    <div className="relative bg-[#041123]/60 backdrop-blur-xl border border-[#D4AF37]/20 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-lg`}>
                          {stat.icon}
                        </div>
                      </div>
                      <p className="text-3xl font-black text-[#D4AF37] mb-1">{stat.value}</p>
                      <p className="text-sm text-[#C6CDD1]/60 font-medium">{stat.label}</p>
                    </div>
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
                      className="flex items-center justify-between p-4 rounded-xl bg-[#010812]/50 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowOrderDetail(true)
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#1257D8]/20 border border-[#D4AF37]/30 flex items-center justify-center">
                          <span className="text-xl">🚗</span>
                        </div>
                        <div>
                          <p className="text-[#D4AF37] font-semibold">{order.make} {order.model} {order.year}</p>
                          <p className="text-xs text-[#C6CDD1]/60">{order.user_name} • {new Date(order.created_at).toLocaleDateString()}</p>
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
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search by vehicle, customer, or order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#010812]/50 border border-[#D4AF37]/20 text-[#C6CDD1] placeholder-[#C6CDD1]/40 focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'pending', 'in-progress', 'completed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                          statusFilter === status
                            ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFE17B] text-[#041123]'
                            : 'bg-[#010812]/50 text-[#C6CDD1] border border-[#D4AF37]/10 hover:bg-[#010812]/80'
                        }`}
                      >
                        {status === 'all' ? 'All' : status.replace('-', ' ')}
                      </button>
                    ))}
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
                        <tr key={order.id} className="border-b border-[#D4AF37]/10 hover:bg-[#010812]/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-[#C6CDD1] font-mono">#{order.id.slice(0, 8)}</td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm text-[#D4AF37] font-semibold">{order.user_name}</p>
                              <p className="text-xs text-[#C6CDD1]/60">{order.user_email}</p>
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
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${statusColors[order.status].bg} ${statusColors[order.status].text} border ${statusColors[order.status].border}`}>
                              {order.status.replace('-', ' ')}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Name</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.user_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#C6CDD1]/60 mb-1">Email</p>
                    <p className="text-sm text-[#C6CDD1]">{selectedOrder.user_email}</p>
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
                          : 'bg-[#041123]/50 text-[#C6CDD1] border border-[#D4AF37]/10 hover:bg-[#041123]/80'
                      }`}
                    >
                      {status.replace('-', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
