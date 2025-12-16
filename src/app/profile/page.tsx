import UserDashboard from '../../components/UserDashboard'

export const metadata = {
  title: 'Profile - BK Auto Trading'
}

export default function Page() {
  return <UserDashboard initialTab="settings" />
}
