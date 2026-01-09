"use client";

import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      ),
      title: "Find a car",
      description: "Search our large inventory or tell us what you're looking for"
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
        </svg>
      ),
      title: "Order your car",
      description: "Place an order with minimal deposit"
    },
    {
      icon: (
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      ),
      title: "Get your car",
      description: "Delivered to your doorstep"
    }
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
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
            id="how-it-works-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent"
          >
            HOW IT WORKS
          </h2>
          <div className="mt-4 flex justify-center">
            <span className="h-1 w-24 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFE17B]" />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-white/15">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group text-center px-0 md:px-10 py-4"
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="text-[#E11D48] bg-white/5 rounded-full ring-1 ring-[#D4AF37]/30 p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:bg-white/10 group-hover:ring-[#D4AF37]/50">
                  {step.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-white mb-3 tracking-tight">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/85 text-base leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Optional Learn More link */}
        <div className="mt-10 md:mt-12 text-center">
          <a
            href="/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#D4AF37]/40 text-white hover:text-[#D4AF37] bg-transparent hover:bg-transparent font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE17B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#6B667A]"
            aria-label="Learn more about the ordering process"
          >
            Learn more
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
