"use client";

import React from 'react';
import Image from 'next/image';

export default function WhyChoose() {
  const reasons = [
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: "Quality Assured",
      description: "Every vehicle is thoroughly inspected and certified before delivery"
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
      ),
      title: "Secure Transactions",
      description: "Your payment and personal information are fully protected"
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
        </svg>
      ),
      title: "Fast Delivery",
      description: "Quick processing and delivery times for all orders"
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
        </svg>
      ),
      title: "24/7 Support",
      description: "Our dedicated team is always ready to assist you"
    }
  ];

  return (
    <section
      aria-labelledby="why-choose-heading"
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-20 md:py-24 bg-[#6B667A] border-y border-white/10"
    >
      <div className="absolute inset-0 pointer-events-none">
        {/* very subtle vignette to add depth, keeps minimal */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_60%)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <h2
            id="why-choose-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent"
          >
            WHY CHOOSE US
          </h2>
          <div className="mt-4 flex justify-center">
            <span className="h-1 w-24 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFE17B]" />
          </div>
        </div>

        {/* Car highlight for visual appeal */}
        <div className="max-w-5xl mx-auto mb-16">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="relative aspect-[16/8]">
              <Image
                src="/images/whychoosecar.png"
                alt="Luxury car showcase"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
                priority
              />
            </div>
          </div>
        </div>

        {/* Reasons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group text-center px-4 py-6"
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="text-[#E11D48] bg-white/5 rounded-full ring-1 ring-[#D4AF37]/30 p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white/10 group-hover:ring-[#D4AF37]/50">
                  {reason.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-white/85 text-base leading-relaxed max-w-sm mx-auto">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
