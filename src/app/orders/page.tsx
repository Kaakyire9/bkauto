import UserDashboard from '../../components/UserDashboard'

export const metadata = {
  title: 'My Orders - BK Auto Trading'
}

export default function Page() {
  return <UserDashboard initialTab="orders" />
}
