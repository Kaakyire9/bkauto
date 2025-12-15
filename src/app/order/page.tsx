import OrderCarForm from '../../components/OrderCarForm'
import Footer from '../../components/Footer'

export const metadata = {
  title: 'Order Vehicle - BK Auto Trading'
}

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-[#6B667A]">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Top golden accent */}
        <div
          className="absolute -top-40 left-1/3 w-96 h-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>
        
        {/* Bottom-right ruby accent */}
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, #C21E3A 0%, transparent 70%)',
            filter: 'blur(80px)'
          }}
        ></div>

        {/* Left side accent line */}
        <div className="absolute top-0 left-0 w-1 h-96 bg-gradient-to-b from-[#D4AF37]/40 to-transparent"></div>
        
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(0deg, #D4AF37 1px, transparent 1px), linear-gradient(90deg, #D4AF37 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center py-16 px-4 relative z-10">
        {/* Left side branding */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6 pl-8">
          <div className="w-1 h-24 bg-gradient-to-b from-[#D4AF37] via-[#D4AF37]/50 to-transparent"></div>
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-[#D4AF37] tracking-widest uppercase">Premium</p>
            <p className="text-xs text-[#C6CDD1]/60">Multi-Step</p>
            <p className="text-xs text-[#C6CDD1]/60">Ordering</p>
          </div>
          <div className="w-1 h-24 bg-gradient-to-t from-[#D4AF37] via-[#D4AF37]/50 to-transparent"></div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-5xl mx-auto">
          <OrderCarForm />
        </div>

        {/* Right side branding */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-6 pr-8">
          <div className="w-1 h-24 bg-gradient-to-b from-[#C21E3A] via-[#C21E3A]/50 to-transparent"></div>
          <div className="text-center space-y-2">
            <p className="text-xs font-bold text-[#C21E3A] tracking-widest uppercase">Secure</p>
            <p className="text-xs text-[#C6CDD1]/60">Encrypted</p>
            <p className="text-xs text-[#C6CDD1]/60">Process</p>
          </div>
          <div className="w-1 h-24 bg-gradient-to-t from-[#C21E3A] via-[#C21E3A]/50 to-transparent"></div>
        </div>
      </div>

      {/* Info bar */}
      <div className="relative z-10 bg-[rgba(212,175,55,0.05)] border-t border-b border-[#D4AF37]/20 py-6 px-4 mb-0">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm">
            <div className="space-y-1">
              <p className="text-[#D4AF37] font-semibold">Expert Sourcing</p>
              <p className="text-[#C6CDD1]/60 text-xs">Our team finds exactly what you need</p>
            </div>
            <div className="space-y-1">
              <p className="text-[#D4AF37] font-semibold">Fast Processing</p>
              <p className="text-[#C6CDD1]/60 text-xs">Quick turnaround on quality vehicles</p>
            </div>
            <div className="space-y-1">
              <p className="text-[#D4AF37] font-semibold">Guaranteed Quality</p>
              <p className="text-[#C6CDD1]/60 text-xs">Every vehicle thoroughly inspected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
