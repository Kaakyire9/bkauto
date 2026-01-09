"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import MotionPrimaryButton from "./ui/MotionPrimaryButton";
import MotionGhostButton from "./ui/MotionGhostButton";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function PremiumHero() {
  const handleHowItWorksClick = () => {
    const section = document.getElementById("how-it-works");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.history?.replaceState) {
        window.history.replaceState(null, "", "#how-it-works");
      }
    }
  };

  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/hero-image.png"
          alt="Premium automotive sourcing experience"
          fill
          priority
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.16),transparent_55%)]" />

      <div className="relative z-10 min-h-screen flex items-center">
        <div className="w-full max-w-6xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 py-20">
          <div className="max-w-3xl">
            <div className="relative rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl px-6 py-10 sm:px-10 lg:px-12 lg:ml-8 ring-1 ring-[#D4AF37]/20 shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_60px_rgba(212,175,55,0.18)]">
              <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.2),transparent_55%)]" />
              <div className="absolute -top-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />
              <div className="absolute -bottom-px left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              <motion.p
                {...fadeUp}
                transition={{ duration: 0.6 }}
                className="text-xs tracking-[0.4em] uppercase text-white/70"
              >
                Concierge Auto Sourcing
              </motion.p>

              <motion.h1
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light tracking-[0.02em] leading-[1.05]"
              >
                <span className="block text-white">Find Your</span>
                <span className="block bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent font-semibold">
                  Dream Car
                </span>
              </motion.h1>

              <motion.div
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-5 h-px w-16 bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-transparent"
              />

              <motion.p
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-2xl"
              >
                We source, you decide. Receive vetted offers from trusted sellers across
                our private network with inspection, shipping, and transparent fees
                included.
              </motion.p>

              <motion.div
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.35 }}
                className="mt-8 flex flex-wrap gap-4"
              >
                <Link href="/order">
                  <MotionPrimaryButton
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 text-base font-semibold"
                  >
                    <span className="flex items-center gap-2">
                      Order Now
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  </MotionPrimaryButton>
                </Link>

                <MotionGhostButton
                  type="button"
                  onClick={handleHowItWorksClick}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 text-base font-medium text-white rounded-xl bg-white/5 border border-white/20 backdrop-blur-xl transition-all"
                >
                  <span className="flex items-center gap-2">
                    How It Works
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </MotionGhostButton>
              </motion.div>

              <motion.div
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70"
              >
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Private seller network
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  White glove inspections
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                  Insured logistics
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
