import SignupForm from '../../components/SignupForm'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Create Account - BK Auto Trading'
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#041123] to-[#061423]">
      <div className="flex-grow flex items-center justify-center py-16">

        {/* FULL WIDTH GRID (FIXED) */}
        <div className="w-screen grid grid-cols-1 md:grid-cols-2 gap-10 items-center px-6 md:px-12">

          {/* LEFT SIDE */}
          <div className="hidden md:flex flex-col items-start gap-6">
            <h2
              className="text-5xl font-extrabold text-[#D4AF37] leading-tight"
              style={{ textShadow: '0 8px 30px rgba(0,0,0,0.6)' }}
            >
              <span className="block shimmer-text shimmer-subtle">Welcome to</span>
              <span className="block shimmer-text">BK Auto Trading</span>
            </h2>

            <p className="text-lg text-[#C6CDD1]/80 max-w-md">
              Create an account to place orders, save favorites, and access premium features including personalized sourcing and priority support.
            </p>

            <div className="mt-4">
              <svg width="280" height="120" viewBox="0 0 560 240" fill="none">
                <path d="M20 150 C80 90, 160 60, 260 60 C360 60, 420 90, 520 150"
                  stroke="#D4AF37"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
                <circle cx="180" cy="170" r="18" fill="#D4AF37" />
                <circle cx="420" cy="170" r="18" fill="#D4AF37" />
              </svg>
            </div>
          </div>

          {/* RIGHT SIDE FORM — NO MORE WHITESPACE */}
          <div className="flex items-center justify-center">
            <SignupForm />
          </div>

        </div>
      </div>

      <Footer />
    </div>
  )
}
