import '../styles/globals.css'
import Navbar from '../components/Navbar'
import PresenceProvider from '../components/PresenceProvider'
import { Toaster } from 'react-hot-toast'
import UserProvider from '../components/UserProvider'
import MessageListenerProviderWrapper from '../components/MessageListenerProviderWrapper'

export const metadata = {
  title: 'bkauto-next',
  description: 'Next.js 14 + TypeScript + Tailwind + Supabase starter'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
        <UserProvider>
          <PresenceProvider />
          <Navbar />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <MessageListenerProviderWrapper>
            <main className="w-full lg:pt-24 transition-all duration-300 ease-in-out">{children}</main>
          </MessageListenerProviderWrapper>
        </UserProvider>
      </body>
    </html>
  )
}

