"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import MotionPrimaryButton from "./ui/MotionPrimaryButton";
import MotionGhostButton from "./ui/MotionGhostButton";

export default function PremiumHero() {
  const handleHowItWorksClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const section = document.getElementById("how-it-works");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.history?.replaceState) {
        window.history.replaceState(null, "", "#how-it-works");
      }
    }
  };

  return (
    <section className="w-full bg-gradient-to-r from-[#0b1118] via-[#111827] to-[#0b1118]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-16 lg:px-24 xl:px-32 pt-24 pb-16 md:pt-28 lg:pt-28 lg:pb-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8 text-white">
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] mb-6">
                <span className="block bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent">
                  Find Your
                </span>
                <span className="block bg-gradient-to-r from-[#C6CDD1] via-[#D4AF37] to-[#1257D8] bg-clip-text text-transparent mt-2">
                  Dream Car
                </span>
              </h1>

              <div className="h-1 w-32 bg-gradient-to-r from-[#D4AF37] via-[#C21E3A] to-transparent rounded-full" />
            </div>

            <p className="text-xl sm:text-2xl text-[#C6CDD1]/90 max-w-2xl leading-relaxed font-light">
              We source, you decide. Receive vetted offers from trusted sellers
              across our private network with inspection, shipping, and
              transparent fees included.
            </p>

            <div className="flex flex-wrap gap-4">
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

              <Link href="#how-it-works" onClick={handleHowItWorksClick}>
                <MotionGhostButton
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 text-base font-medium text-white rounded-xl bg-bk-gold/5 border border-bk-gold/30 backdrop-blur-xl transition-all"
                >
                  <span className="flex items-center gap-2">
                    How It Works
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </MotionGhostButton>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4">
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
            </div>
          </div>

          <div className="flex justify-end lg:justify-start lg:ml-6 lg:-mr-12 xl:-mr-24">
            <Image
              src="/images/hero-image.png"
              alt="Premium automotive sourcing experience"
              width={1000}
              height={700}
              priority
              className="w-full max-w-[1024px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
