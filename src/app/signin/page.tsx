import SignInForm from '../../components/SignInForm'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Sign In - BK Auto Trading'
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#010812] via-[#041123] to-[#0a1b2e]">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-left golden glow */}
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>
        
        {/* Bottom-right sapphire glow */}
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #1257D8 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>

        {/* Accent line from top */}
        <div className="absolute top-0 left-1/4 w-1 h-64 bg-gradient-to-b from-[#D4AF37]/40 to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center py-16 px-4 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* LEFT SIDE - Premium messaging */}
          <div className="hidden md:flex flex-col items-start gap-8 px-6">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/30">
                  Premium Access
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE17B] to-[#D4AF37] leading-tight">
                Exclusive Trading Platform
              </h2>
              <p className="text-lg text-[#C6CDD1]/80 max-w-lg leading-relaxed">
                Access premium sourcing, priority support, and personalized vehicle recommendations from BK Auto Trading's expert team.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4 pt-4">
              {[
                { icon: '✓', text: 'Personalized sourcing assistance' },
                { icon: '✓', text: 'Real-time inventory access' },
                { icon: '✓', text: '24/7 priority support' },
                { icon: '✓', text: 'Exclusive deals & early access' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[#D4AF37] font-bold text-lg">{feature.icon}</span>
                  <span className="text-[#C6CDD1]/70">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Decorative elements */}
            <div className="pt-8">
              <svg width="300" height="80" viewBox="0 0 300 80" fill="none" className="opacity-60">
                <rect x="20" y="20" width="60" height="40" stroke="#D4AF37" strokeWidth="2" fill="none" rx="4" />
                <rect x="100" y="15" width="80" height="50" stroke="#D4AF37" strokeWidth="2" fill="none" rx="4" />
                <rect x="200" y="10" width="70" height="60" stroke="#D4AF37" strokeWidth="2" fill="none" rx="4" />
              </svg>
            </div>
          </div>

          {/* RIGHT SIDE - Sign In Form */}
          <div className="flex items-center justify-center">
            <SignInForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
