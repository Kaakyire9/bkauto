"use client";

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import MotionPrimaryButton from "./ui/MotionPrimaryButton";
import MotionGhostButton from "./ui/MotionGhostButton";

export default function Hero() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentStat, setCurrentStat] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]);

  const stats = [
    { value: "500+", label: "Premium Vehicles Sourced", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { value: "98%", label: "Customer Satisfaction", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { value: "24/7", label: "Concierge Support", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { value: "$50M+", label: "Total Value Delivered", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
  ];

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handle = () => setReducedMotion(mq.matches);
    handle();
    if (mq.addEventListener) mq.addEventListener('change', handle);
    else mq.addListener(handle);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handle);
      else mq.removeListener(handle);
    };
  }, []);

  // Mouse parallax effect
  useEffect(() => {
    if (reducedMotion) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  // Rotating stats
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Video autoplay logic
  useEffect(() => {
    if (reducedMotion) return;
    let attempts = 0;
    const maxAttempts = 8;
    let mounted = true;

    const tryPlay = async () => {
      const v = videoRef.current;
      if (!v || !mounted) return;
      try {
        v.setAttribute('webkit-playsinline', 'true');
      } catch {}
      try {
        v.muted = true;
        await v.play();
      } catch (err) {
        attempts += 1;
        if (attempts < maxAttempts) {
          const delay = 200 * Math.pow(2, attempts);
          setTimeout(tryPlay, delay);
        }
      }
    };

    tryPlay();

    const onVisibility = () => {
      if (document.visibilityState === 'visible') tryPlay();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onUserGesture = () => tryPlay();
    window.addEventListener('pointerdown', onUserGesture, { once: true });
    window.addEventListener('touchstart', onUserGesture, { once: true });
    window.addEventListener('keydown', onUserGesture, { once: true });

    return () => {
      mounted = false;
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointerdown', onUserGesture as any);
      window.removeEventListener('touchstart', onUserGesture as any);
      window.removeEventListener('keydown', onUserGesture as any);
    };
  }, [reducedMotion]);

  return (
    <section 
      ref={heroRef}
      className="relative left-1/2 -translate-x-1/2 w-screen min-h-screen overflow-hidden"
    >
      {/* Background Video with Parallax */}
      <motion.div 
        className="absolute inset-0"
        style={{ scale }}
      >
        {reducedMotion ? (
          <div className="absolute inset-0">
            <Image 
              src="/images/hero-poster.jpg" 
              alt="Luxury automotive experience" 
              fill 
              className="object-cover" 
              priority 
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
            preload="auto"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
        )}
      </motion.div>

      {/* Background overlays and decorative ornaments removed so video is unobstructed */}

      {/* Main Content */}
      <motion.div 
        className="relative w-full h-full min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white z-30"
        style={{ opacity }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              {/* Premium badge removed as requested */}

              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] mb-6">
                  <span 
                    className="block bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent"
                    style={{ 
                      textShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
                      backgroundSize: '200% auto',
                      animation: 'shimmer 8s linear infinite'
                    }}
                  >
                    Find Your
                  </span>
                  <span 
                    className="block bg-gradient-to-r from-[#C6CDD1] via-[#D4AF37] to-[#1257D8] bg-clip-text text-transparent mt-2"
                    style={{ 
                      textShadow: '0 0 60px rgba(212, 175, 55, 0.3)',
                      backgroundSize: '200% auto',
                      animation: 'shimmer 8s linear infinite',
                      animationDelay: '1s'
                    }}
                  >
                    Dream Car
                  </span>
                </h1>

                <div className="h-1 w-32 bg-gradient-to-r from-[#D4AF37] via-[#C21E3A] to-transparent rounded-full" />
              </motion.div>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl sm:text-2xl text-[#C6CDD1]/90 max-w-2xl leading-relaxed font-light"
              >
                We source, you decide. Receive offers from trusted sellers across our exclusive network.
                <span className="block mt-2 text-[#D4AF37]/80">
                  Inspection, shipping, and transparent fees included.
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link href="/order">
                  <MotionPrimaryButton whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="px-8 py-4 text-base font-semibold">
                    <span className="flex items-center gap-2">
                      Order Now
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </MotionPrimaryButton>
                </Link>

                <Link href="/how-it-works">
                  <MotionGhostButton whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="px-8 py-4 text-base font-medium text-white rounded-xl bg-bk-gold/5 border border-bk-gold/30 backdrop-blur-xl transition-all">
                    <span className="flex items-center gap-2">
                      How It Works
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                  </MotionGhostButton>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0FA662]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#C6CDD1]/70">No inventory pressure</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0FA662]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#C6CDD1]/70">Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#0FA662]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-[#C6CDD1]/70">Insured shipping</span>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats & Features */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="hidden lg:block"
            >
              {/* Rotating Stats Card */}
              <div className="relative">
                <div 
                  className="relative p-8 rounded-3xl backdrop-blur-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(18, 87, 216, 0.1))',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Decorative corner elements */}
                  <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#D4AF37]/30 rounded-tl-3xl" />
                  <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#D4AF37]/30 rounded-br-3xl" />
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStat}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="text-center space-y-4"
                    >
                      <motion.div
                        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(18, 87, 216, 0.2))',
                          border: '1px solid rgba(212, 175, 55, 0.3)'
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <svg className="w-8 h-8 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stats[currentStat].icon} />
                        </svg>
                      </motion.div>
                      
                      <div>
                        <div className="text-5xl font-bold bg-gradient-to-r from-[#D4AF37] to-[#C6CDD1] bg-clip-text text-transparent mb-2">
                          {stats[currentStat].value}
                        </div>
                        <div className="text-[#C6CDD1]/80 text-lg">
                          {stats[currentStat].label}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Progress Indicators */}
                  <div className="flex justify-center gap-2 mt-6">
                    {stats.map((_, index) => (
                      <motion.div
                        key={index}
                        className="h-1 rounded-full"
                        style={{
                          width: currentStat === index ? 32 : 8,
                          background: currentStat === index 
                            ? 'linear-gradient(90deg, #D4AF37, #1257D8)' 
                            : 'rgba(212, 175, 55, 0.3)'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    ))}
                  </div>
                </div>

                {/* Additional Feature Cards */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[
                    { label: "White Glove Service", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
                    { label: "Global Network", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="p-5 rounded-2xl backdrop-blur-xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(18, 87, 216, 0.05))',
                        border: '1px solid rgba(212, 175, 55, 0.15)'
                      }}
                    >
                      <svg className="w-6 h-6 text-[#D4AF37] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      <div className="text-sm text-[#C6CDD1]/90 font-medium">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-[#C6CDD1]/60 tracking-widest">SCROLL TO EXPLORE</span>
          <div className="w-6 h-10 rounded-full border-2 border-[#D4AF37]/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
            />
          </div>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }
      `}</style>
    </section>
  );
}
