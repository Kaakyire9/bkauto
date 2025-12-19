import AdminDashboard from '../../components/AdminDashboard'

export const metadata = {
  title: 'Admin Panel - BK Auto Trading'
}

// Admin dashboard depends on client-side hooks (auth, search params, etc.)
// so we force this route to be fully dynamic to avoid prerender issues.
export const dynamic = 'force-dynamic'

export default function Page() {
  return <AdminDashboard />
}
