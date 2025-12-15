import ForgotPasswordForm from '../../components/ForgotPasswordForm'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Forgot Password - BK Auto Trading'
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#6B667A]">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top-right golden glow */}
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>
        
        {/* Bottom-left emerald glow */}
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #0FA662 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>

        {/* Accent lines */}
        <div className="absolute top-0 right-1/4 w-1 h-64 bg-gradient-to-b from-[#D4AF37]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-1/3 w-1 h-48 bg-gradient-to-t from-[#0FA662]/30 to-transparent"></div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center py-16 px-4 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* LEFT SIDE - Premium messaging */}
          <div className="hidden md:flex flex-col items-start gap-8 px-6">
            <div className="space-y-4">
              <div className="inline-block">
                <span className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase bg-[#D4AF37]/10 px-4 py-2 rounded-full border border-[#D4AF37]/30">
                  Account Security
                </span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFE17B] to-[#D4AF37] leading-tight">
                Secure Password Reset
              </h2>
              <p className="text-lg text-[#C6CDD1]/80 max-w-lg leading-relaxed">
                We take your account security seriously. Reset your password quickly and securely with our encrypted process.
              </p>
            </div>

            {/* Security features */}
            <div className="space-y-4 pt-4">
              {[
                { icon: '🔒', text: 'End-to-end encrypted process' },
                { icon: '⚡', text: 'Instant reset link delivery' },
                { icon: '🛡️', text: '24-hour link expiration' },
                { icon: '✓', text: 'Multi-factor authentication support' }
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl">{feature.icon}</span>
                  <span className="text-[#C6CDD1]/70">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Decorative security badge */}
            <div className="pt-8 flex items-center gap-4 p-4 bg-[#0FA662]/5 border border-[#0FA662]/20 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-[#0FA662]/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-[#0FA662]" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="text-[#0FA662] font-semibold">SSL Secured</p>
                <p className="text-[#C6CDD1]/60 text-xs">Your data is encrypted in transit</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Reset Password Form */}
          <div className="flex items-center justify-center">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
