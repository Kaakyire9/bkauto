import '../styles/globals.css'
import Navbar from '../components/Navbar'

export const metadata = {
  title: 'bkauto-next',
  description: 'Next.js 14 + TypeScript + Tailwind + Supabase starter'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
        <Navbar />
        <main className="max-w-3xl mx-auto p-6 lg:pt-24 transition-all duration-300 ease-in-out safe-area-x">{children}</main>
      </body>
    </html>
  )
}
