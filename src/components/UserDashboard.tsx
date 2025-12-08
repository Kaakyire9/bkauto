"use client"
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import MotionPrimaryButton from './ui/MotionPrimaryButton'
import MotionGhostButton from './ui/MotionGhostButton'

interface UserStats {
  ordersPlaced: number
  vehiclesSourced: number
  activeOrders: number
  savedVehicles: number
}

interface RecentOrder {
  id: string
  vehicle: string
  status: 'pending' | 'in-progress' | 'completed'
  date: string
  amount: string
}

export default function UserDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'vehicles' | 'settings'>('overview')
  const [user, setUser] = useState({
    name: 'Guest User',
    email: 'user@example.com',
    member_since: 'January 2024',
    tier: 'Premium',
    avatar: null as string | null
  })
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<UserStats>({
    ordersPlaced: 0,
    vehiclesSourced: 0,
    activeOrders: 0,
    savedVehicles: 0
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])

  // Fetch user data and orders on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/signin')
          return
        }

        const userId = session.user.id
        const email = session.user.email || 'user@example.com'
        const fullName = session.user.user_metadata?.full_name || 'Guest User'
        const createdAt = new Date(session.user.created_at)
        const memberSince = createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

        setUser(prev => ({
          ...prev,
          name: fullName,
          email: email,
          member_since: memberSince
        }))

        // Fetch orders from orders table (you'll need to create this table in Supabase)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!ordersError && ordersData) {
          // Calculate stats
          const activeCount = ordersData.filter((o: any) => o.status === 'in-progress' || o.status === 'pending').length
          const completedCount = ordersData.filter((o: any) => o.status === 'completed').length

          setStats({
            ordersPlaced: ordersData.length,
            vehiclesSourced: completedCount,
            activeOrders: activeCount,
            savedVehicles: 0 // Will update when saved_vehicles table is created
          })

          // Map orders to display format
          const formattedOrders = ordersData.slice(0, 3).map((order: any) => ({
            id: `#ORD-${order.id.slice(0, 8).toUpperCase()}`,
            vehicle: `${order.make} ${order.model} ${order.year}`,
            status: order.status || 'pending',
            date: new Date(order.created_at).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            }),
            amount: '$0' // Add budget field to orders table if needed
          }))
          
          setRecentOrders(formattedOrders)
        }

        // Fetch saved vehicles (when table is created)
        const { data: vehiclesData } = await supabase
          .from('saved_vehicles')
          .select('*')
          .eq('user_id', userId)

        if (vehiclesData) {
          setStats(prev => ({
            ...prev,
            savedVehicles: vehiclesData.length
          }))
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statusColors = {
    'pending': { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/30' },
    'in-progress': { bg: 'bg-[#1257D8]/10', text: 'text-[#1257D8]', border: 'border-[#1257D8]/30' },
    'completed': { bg: 'bg-[#10B981]/10', text: 'text-[#10B981]', border: 'border-[#10B981]/30' }
  }

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadMessage({ type: 'error', text: 'Please upload an image file' })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage({ type: 'error', text: 'File size must be less than 5MB' })
      return
    }

    setUploadingProfile(true)
    try {
      // Create a FileReader to convert the image to a data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = event.target?.result as string
        setUser(prev => ({ ...prev, avatar: imageData }))
        setUploadMessage({ type: 'success', text: 'Profile picture updated successfully!' })
        setTimeout(() => setUploadMessage(null), 3000)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'Failed to upload profile picture' })
    } finally {
      setUploadingProfile(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#010812] via-[#041123] to-[#0a1b2e]">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #1257D8 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>
      </div>

      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 pointer-events-auto">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#D4AF37] font-semibold">Loading your dashboard...</p>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border-b border-[#D4AF37]/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                {/* Profile Picture */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#1257D8]/20 border-2 border-[#D4AF37]/30 flex items-center justify-center overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <label className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      disabled={uploadingProfile}
                      className="hidden"
                      aria-label="Upload profile picture"
                    />
                  </label>
                </div>

                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-black text-[#D4AF37]">Welcome Back, {user.name.split(' ')[0]}</h1>
                  <p className="text-sm text-[#C6CDD1]/60 mt-1">{user.tier} Member • Joined {user.member_since}</p>
                  {uploadMessage && (
                    <p className={`text-xs mt-2 ${uploadMessage.type === 'success' ? 'text-[#10B981]' : 'text-[#E11D48]'}`}>
                      {uploadMessage.text}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => router.push('/settings')}
                className="p-3 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 transition-colors text-[#D4AF37]"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.64l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.09-.47 0-.59.22L2.74 8.87c-.12.22-.07.49.12.64l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.64l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.64l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Orders Placed', value: stats.ordersPlaced, icon: '📦', color: '#D4AF37' },
              { label: 'Vehicles Sourced', value: stats.vehiclesSourced, icon: '🚗', color: '#1257D8' },
              { label: 'Active Orders', value: stats.activeOrders, icon: '⚡', color: '#F59E0B' },
              { label: 'Saved Vehicles', value: stats.savedVehicles, icon: '❤️', color: '#C21E3A' }
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-[rgba(4,17,35,0.6)] backdrop-blur-sm border border-[#D4AF37]/10 rounded-2xl p-6 hover:border-[#D4AF37]/30 transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{stat.icon}</span>
                  <div className="w-2 h-2 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-3xl font-black text-[#D4AF37] mb-1">{stat.value}</h3>
                <p className="text-sm text-[#C6CDD1]/60">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-[#D4AF37]/10 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'orders', label: 'My Orders', icon: '📋' },
              { id: 'vehicles', label: 'Saved Vehicles', icon: '💾' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'text-[#D4AF37] border-[#D4AF37]'
                    : 'text-[#C6CDD1]/60 border-transparent hover:text-[#D4AF37]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Orders */}
              <div className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-[#D4AF37]">Recent Orders</h2>
                  <MotionGhostButton onClick={() => setActiveTab('orders')} className="text-sm px-4 py-2 rounded-lg text-white">
                    View All
                  </MotionGhostButton>
                </div>
                <div className="space-y-4">
                  {recentOrders.map((order, i) => (
                    <div key={i} className="bg-[#041123]/40 border border-[#D4AF37]/10 rounded-xl p-5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all">
                      <div className="flex-1">
                        <p className="font-semibold text-white mb-1">{order.vehicle}</p>
                        <p className="text-xs text-[#C6CDD1]/60">{order.id} • {order.date}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status].bg} ${statusColors[order.status].text} ${statusColors[order.status].border}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="font-black text-[#D4AF37]">{order.amount}</span>
                        <svg className="w-5 h-5 text-[#C6CDD1]/40 group-hover:text-[#D4AF37] transition-colors" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'New Order', desc: 'Start sourcing your next vehicle', action: '/order', icon: '➕' },
                  { title: 'Browse Inventory', desc: 'Explore available vehicles', action: '/inventory', icon: '🔍' },
                  { title: 'Support Center', desc: 'Get help from our team', action: '/support', icon: '💬' }
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => router.push(action.action)}
                    className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-6 hover:border-[#D4AF37]/40 transition-all text-left group"
                  >
                    <div className="text-3xl mb-3">{action.icon}</div>
                    <h3 className="font-black text-[#D4AF37] mb-2">{action.title}</h3>
                    <p className="text-sm text-[#C6CDD1]/60 mb-4">{action.desc}</p>
                    <div className="inline-flex items-center gap-2 text-xs text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity">
                      Visit <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-8">
              <h2 className="text-xl font-black text-[#D4AF37] mb-6">All Orders</h2>
              <div className="space-y-4">
                {recentOrders.map((order, i) => (
                  <div key={i} className="bg-[#041123]/40 border border-[#D4AF37]/10 rounded-xl p-5 flex items-center justify-between group hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                    <div className="flex-1">
                      <p className="font-semibold text-white mb-1">{order.vehicle}</p>
                      <p className="text-xs text-[#C6CDD1]/60">{order.id} • {order.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[order.status].bg} ${statusColors[order.status].text} ${statusColors[order.status].border}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="font-black text-[#D4AF37]">{order.amount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <div className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-8">
              <h2 className="text-xl font-black text-[#D4AF37] mb-6">Saved Vehicles ({stats.savedVehicles})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: '2024 BMW M440i', price: '$65,000', saved: '2 days ago' },
                  { name: '2023 Mercedes-AMG E63', price: '$89,500', saved: '1 week ago' },
                  { name: '2023 Porsche 911 Carrera', price: '$105,000', saved: '2 weeks ago' },
                  { name: '2024 Audi RS6 Avant', price: '$115,000', saved: '3 weeks ago' },
                  { name: '2023 Range Rover Sport', price: '$95,000', saved: '1 month ago' },
                  { name: '2024 Tesla Model S Plaid', price: '$125,000', saved: '1 month ago' }
                ].map((vehicle, i) => (
                  <div key={i} className="bg-[#041123]/40 border border-[#D4AF37]/10 rounded-xl p-5 group hover:border-[#D4AF37]/30 transition-all cursor-pointer">
                    <div className="w-full h-40 bg-gradient-to-br from-[#D4AF37]/20 to-[#1257D8]/20 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-4xl">🚗</span>
                    </div>
                    <h3 className="font-semibold text-white mb-2">{vehicle.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#D4AF37]">{vehicle.price}</span>
                      <svg className="w-5 h-5 text-[#C21E3A]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    </div>
                    <p className="text-xs text-[#C6CDD1]/60 mt-3">Saved {vehicle.saved}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-8">
                <h2 className="text-xl font-black text-[#D4AF37] mb-6">Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-[#D4AF37] mb-2 block">Full Name</label>
                    <input type="text" defaultValue={user.name} className="w-full px-4 py-2 rounded-lg bg-[#041123]/40 border border-[#D4AF37]/15 text-white" disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#D4AF37] mb-2 block">Email Address</label>
                    <input type="email" defaultValue={user.email} className="w-full px-4 py-2 rounded-lg bg-[#041123]/40 border border-[#D4AF37]/15 text-white" disabled />
                  </div>
                  <div className="pt-4 border-t border-[#D4AF37]/10">
                    <p className="text-sm text-[#C6CDD1]/60 mb-4">Member Since: {user.member_since}</p>
                    <p className="text-sm text-[#C6CDD1]/60">Tier: <span className="text-[#D4AF37] font-semibold">{user.tier}</span></p>
                  </div>
                  <div className="pt-4 flex gap-3">
                    <MotionPrimaryButton className="px-6 py-2 rounded-lg">Update Profile</MotionPrimaryButton>
                    <MotionGhostButton className="px-6 py-2 rounded-lg text-white">Change Password</MotionGhostButton>
                  </div>
                </div>
              </div>

              <div className="bg-[rgba(4,17,35,0.6)] backdrop-blur-xl border border-[#D4AF37]/10 rounded-2xl p-8">
                <h2 className="text-lg font-black text-[#D4AF37] mb-4">Preferences</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-[#C6CDD1]">Receive order notifications</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm text-[#C6CDD1]">Subscribe to new inventory alerts</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm text-[#C6CDD1]">Marketing emails</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
