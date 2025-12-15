"use client";

import React, { useState, useEffect } from 'react';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const testimonials = [
    {
      name: "Amina Jallow",
      role: "Business Owner",
      image: "AJ",
      rating: 5,
      text: "Exceptional service from start to finish. The team made importing my dream car effortless and the entire process was transparent."
    },
    {
      name: "Ousman Ba",
      role: "Car Enthusiast",
      image: "OB",
      rating: 5,
      text: "I've imported three vehicles through BK Auto Trading. Their expertise and attention to detail are unmatched in the industry."
    },
    {
      name: "Fatou Sano",
      role: "First-time Buyer",
      image: "FS",
      rating: 5,
      text: "As a first-time importer, I was nervous. The support team guided me through every step and delivered exactly what was promised."
    },
    {
      name: "Lamin Touray",
      role: "Logistics Manager",
      image: "LT",
      rating: 5,
      text: "Professional, reliable, and trustworthy. BK Auto Trading exceeded all my expectations and made the entire import process seamless."
    },
    {
      name: "Mariama Camara",
      role: "Entrepreneur",
      image: "MC",
      rating: 5,
      text: "Outstanding customer service and quality vehicles. I recommend them to everyone looking for premium imports at fair prices."
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, testimonials.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 7000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 7000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 7000);
  };

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-20 md:py-24 bg-[#6B667A] border-y border-white/10"
    >
      <div className="absolute inset-0 pointer-events-none">
        {/* very subtle vignette to add depth, keeps minimal */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_60%)]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14 md:mb-16">
          <h2
            id="testimonials-heading"
            className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#D4AF37] via-[#C6CDD1] to-[#D4AF37] bg-clip-text text-transparent"
          >
            WHAT OUR CLIENTS SAY
          </h2>
          <div className="mt-4 flex justify-center">
            <span className="h-1 w-24 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFE17B]" />
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Testimonials Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`
              }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 px-4"
                >
                  <div className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 ring-1 ring-white/10 transition-all duration-300 hover:bg-white/10 hover:ring-[#D4AF37]/30 hover:-translate-y-1">
                    {/* Quote icon */}
                    <div className="absolute top-6 right-6 text-[#D4AF37]/20">
                      <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                      </svg>
                    </div>

                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-[#041123] font-bold text-lg relative overflow-hidden ring-2 ring-[#D4AF37]/40"
                        style={{
                          background: 'linear-gradient(135deg, #D4AF37 0%, #C6CDD1 50%, #1257D8 100%)',
                          boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
                        }}
                      >
                        {testimonial.image}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{testimonial.name}</h3>
                        <p className="text-sm text-white/60">{testimonial.role}</p>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-5 h-5 text-[#D4AF37]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Testimonial text */}
                    <p className="text-white/85 text-base leading-relaxed relative z-10">
                      "{testimonial.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previous Button */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 md:-translate-x-14 z-10 p-2 text-[#D4AF37] hover:text-[#FFE17B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE17B]"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Next Button */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-14 z-10 p-2 text-[#D4AF37] hover:text-[#FFE17B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFE17B]"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#D4AF37] w-8'
                    : 'bg-white/20 hover:bg-white/40 w-2'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
                aria-current={index === currentIndex ? 'true' : 'false'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
