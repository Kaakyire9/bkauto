"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import MotionPrimaryButton from "./ui/MotionPrimaryButton";
import MotionGhostButton from "./ui/MotionGhostButton";

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });

  const steps = [
    {
      number: "01",
      title: "Place Your Order",
      subtitle: "Define Your Dream",
      description: "Submit your vehicle specifications, budget, and preferences. Our AI-powered system matches you with the perfect options from our exclusive network.",
      icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      features: ["Custom specifications", "Budget flexibility", "Instant matching"],
      color: "#D4AF37",
      gradient: "from-[#D4AF37] to-[#886f1d]"
    },
    {
      number: "02",
      title: "Secure Deposit",
      subtitle: "Lock In Your Search",
      description: "Make a refundable deposit to activate your order. Your funds are held securely in escrow, protecting both you and our network of trusted sellers.",
      icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
      features: ["Refundable deposit", "Escrow protection", "Instant activation"],
      color: "#6B667A",
      gradient: "from-[#6B667A] to-[#4d4a5a]"
    },
    {
      number: "03",
      title: "We Source & Match",
      subtitle: "Curated Selection",
      description: "Our expert team scours our global network to find verified offers. Receive multiple options with detailed inspections, history reports, and transparent pricing.",
      icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
      features: ["Global network access", "Expert verification", "Multiple offers"],
      color: "#0FA662",
      gradient: "from-[#0FA662] to-[#0c814c]"
    },
    {
      number: "04",
      title: "Review & Decide",
      subtitle: "Your Choice, Your Terms",
      description: "Compare offers side-by-side with full transparency. Ask questions, request additional photos, or schedule virtual inspections. No pressure, just premium service.",
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      features: ["Side-by-side comparison", "Full transparency", "Virtual inspections"],
      color: "#C21E3A",
      gradient: "from-[#C21E3A] to-[#8b1529]"
    },
    {
      number: "05",
      title: "White Glove Delivery",
      subtitle: "Seamless Handover",
      description: "We handle everything: paperwork, payment processing, shipping coordination, and insurance. Track your vehicle in real-time until it arrives at your doorstep.",
      icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4",
      features: ["Full concierge service", "Real-time tracking", "Insured shipping"],
      color: "#FF7A18",
      gradient: "from-[#FF7A18] to-[#c55400]"
    }
  ];

  useEffect(() => {
    if (!isInView) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <section 
  ref={sectionRef}
  className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-24 lg:py-32 overflow-hidden"

      style={{ 
        position: 'relative',
        background: '#6B667A',
      }}
    >
      {/* Animated Background Elements - Very Subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.008] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.008] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #6B667A 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      {/* Decorative grid pattern - Very Subtle */}
      <div 
        className="absolute inset-0 opacity-[0.003] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(212, 175, 55, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 175, 55, 0.5) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative w-full px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6 backdrop-blur-xl border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(18, 87, 216, 0.15), rgba(4, 17, 35, 0.95))',
              borderColor: 'rgba(212, 175, 55, 0.4)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-[#D4AF37]"
              style={{
                boxShadow: '0 0 15px #D4AF37'
              }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span 
              className="text-sm font-bold tracking-wider"
              style={{
                color: '#D4AF37'
              }}
            >
              THE JOURNEY
            </span>
          </motion.div>

          <h2 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 50%, #FFFFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            How It Works
          </h2>
          
          <p 
            className="text-xl leading-relaxed max-w-3xl mx-auto font-medium"
            style={{
              color: '#E8E8E8'
            }}
          >
            From vision to reality in five seamless steps. Experience automotive luxury procurement redefined.
          </p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-px w-32 mx-auto mt-8"
            style={{
              background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
              boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)'
            }}
          />
        </motion.div>

        {/* Desktop Timeline View */}
        <div className="hidden lg:block relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 via-[#6B667A]/20 to-[#D4AF37]/20" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#6B667A] to-[#0FA662]"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2, delay: 0.5 }}
              style={{ transformOrigin: "left" }}
            />
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-5 gap-8 z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Card */}
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="relative group cursor-pointer"
                  onHoverStart={() => setActiveStep(index)}
                >
                  {/* Glow Effect - More Subtle */}
                  <motion.div
                    className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}30, ${step.color}15)`
                    }}
                  />

                  {/* Card - Maximum Contrast */}
                  <div
                    className="relative p-8 rounded-3xl backdrop-blur-xl overflow-hidden border-2"
                    style={{
                      background: activeStep === index 
                        ? `linear-gradient(135deg, ${step.color}18, rgba(4, 17, 35, 0.98))`
                        : 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(4, 17, 35, 0.98))',
                      borderColor: activeStep === index ? step.color + '60' : 'rgba(212, 175, 55, 0.2)',
                      boxShadow: activeStep === index 
                        ? `0 20px 60px ${step.color}30, inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.5)` 
                        : 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    {/* Decorative corner - More Visible */}
                    <div 
                      className="absolute top-0 right-0 w-20 h-20 opacity-30"
                      style={{
                        background: `radial-gradient(circle at top right, ${step.color}60, transparent)`
                      }}
                    />

                    {/* Number Badge */}
                    <motion.div
                      className="relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                        border: `2px solid ${step.color}30`
                      }}
                      animate={activeStep === index ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <span 
                        className="text-3xl font-bold"
                        style={{ color: step.color }}
                      >
                        {step.number}
                      </span>
                      
                      {/* Rotating border effect */}
                      {activeStep === index && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            border: `2px solid ${step.color}`,
                            borderTop: '2px solid transparent'
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </motion.div>

                    {/* Icon */}
                    <motion.div
                      className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}15, ${step.color}05)`,
                        border: `1px solid ${step.color}20`
                      }}
                      animate={activeStep === index ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <svg 
                        className="w-6 h-6"
                        style={{ color: step.color }}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                      </svg>
                    </motion.div>

                    {/* Content - Maximum Contrast */}
                    <div className="text-center space-y-3">
                      <h3 
                        className="text-xl font-bold"
                        style={{ 
                          color: activeStep === index ? step.color : '#FFFFFF'
                        }}
                      >
                        {step.title}
                      </h3>
                      <p 
                        className="text-sm font-semibold"
                        style={{
                          color: '#D4AF37'
                        }}
                      >
                        {step.subtitle}
                      </p>
                      <p 
                        className="text-sm leading-relaxed font-medium" 
                        style={{ 
                          color: '#E8E8E8'
                        }}
                      >
                        {step.description}
                      </p>

                      {/* Features - Maximum Contrast */}
                      <div className="pt-4 space-y-2">
                        {step.features.map((feature, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2 text-xs font-semibold"
                            style={{ 
                              color: '#E0E0E0'
                            }}
                          >
                            <div 
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ 
                                backgroundColor: step.color,
                                boxShadow: `0 0 12px ${step.color}, 0 0 4px ${step.color}`
                              }}
                            />
                            {feature}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom accent */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`
                      }}
                      animate={activeStep === index ? { opacity: [0.3, 0.8, 0.3] } : { opacity: 0.2 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

                {/* Connection Node */}
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full z-20"
                  style={{
                    background: activeStep === index 
                      ? `radial-gradient(circle, ${step.color}, ${step.color}80)`
                      : 'radial-gradient(circle, #D4AF37, #886f1d)',
                    border: '3px solid #041123',
                    boxShadow: activeStep === index ? `0 0 30px ${step.color}80` : '0 0 20px rgba(212, 175, 55, 0.5)'
                  }}
                  animate={activeStep === index ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            ))}
          </div>

          {/* Progress Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 }}
            className="flex justify-center gap-3 mt-16"
          >
            {steps.map((step, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveStep(index)}
                className="relative h-2 rounded-full transition-all"
                style={{
                  width: activeStep === index ? 48 : 16,
                  background: activeStep === index 
                    ? `linear-gradient(90deg, ${step.color}, ${step.color}80)`
                    : 'rgba(212, 175, 55, 0.2)'
                }}
                whileHover={{ scale: 1.2 }}
              />
            ))}
          </motion.div>
        </div>

        {/* Mobile Vertical View */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-10 top-24 bottom-0 w-0.5">
                  <div 
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, ${step.color}, ${steps[index + 1].color})`
                    }}
                  />
                </div>
              )}

              <div className="relative flex gap-6">
                {/* Number Badge */}
                <motion.div
                  className="relative flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center z-10"
                  style={{
                    background: `linear-gradient(135deg, ${step.color}20, ${step.color}10)`,
                    border: `2px solid ${step.color}30`,
                    boxShadow: `0 10px 30px ${step.color}20`
                  }}
                  whileInView={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: step.color }}
                  >
                    {step.number}
                  </span>
                </motion.div>

                {/* Card - Maximum Contrast Mobile */}
                <motion.div
                  whileInView={{ scale: [0.95, 1] }}
                  className="flex-1 p-6 rounded-2xl backdrop-blur-xl border-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(4, 17, 35, 0.98))',
                    borderColor: `${step.color}50`,
                    boxShadow: `0 10px 40px ${step.color}25, inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.5)`
                  }}
                >
                  {/* Icon */}
                  <div
                    className="inline-flex w-12 h-12 mb-4 rounded-xl items-center justify-center border-2"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}30, ${step.color}15)`,
                      borderColor: `${step.color}50`
                    }}
                  >
                    <svg 
                      className="w-6 h-6"
                      style={{ color: step.color }}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>

                  <h3 
                    className="text-2xl font-bold mb-2"
                    style={{ 
                      color: step.color
                    }}
                  >
                    {step.title}
                  </h3>
                  <p 
                    className="text-sm font-semibold mb-3"
                    style={{
                      color: '#D4AF37'
                    }}
                  >
                    {step.subtitle}
                  </p>
                  <p 
                    className="text-sm leading-relaxed mb-4 font-medium" 
                    style={{ 
                      color: '#E8E8E8'
                    }}
                  >
                    {step.description}
                  </p>

                  {/* Features - Maximum Contrast */}
                  <div className="space-y-2">
                    {step.features.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs font-semibold"
                        style={{ 
                          color: '#E0E0E0'
                        }}
                      >
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ 
                            backgroundColor: step.color,
                            boxShadow: `0 0 12px ${step.color}, 0 0 4px ${step.color}`
                          }}
                        />
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Bottom accent */}
                  <div
                    className="mt-4 h-1 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${step.color}, transparent)`,
                      boxShadow: `0 0 15px ${step.color}70`
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-24 text-center"
        >
          <div
            className="relative inline-block p-12 rounded-3xl backdrop-blur-xl overflow-hidden border-2"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15), rgba(18, 87, 216, 0.12), rgba(4, 17, 35, 0.98))',
              borderColor: 'rgba(212, 175, 55, 0.4)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
            }}
          >
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-[#D4AF37]/50 rounded-tl-3xl" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br-3xl" />

            <h3
              className="text-5xl md:text-6xl font-black mb-6"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #D4AF37 50%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Ready to Start Your Journey?
            </h3>
            <p 
              className="text-lg mb-8 max-w-2xl mx-auto font-medium"
              style={{
                color: '#E8E8E8'
              }}
            >
              Join hundreds of satisfied clients who found their dream vehicles through our premium service.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/order">
                <MotionPrimaryButton
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative px-8 py-4 text-base font-semibold rounded-xl overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Place Your Order
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#C21E3A]/30 via-[#1257D8]/30 to-[#0FA662]/30"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                </MotionPrimaryButton>
              </Link>

              <Link href="/contact">
                <MotionGhostButton
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-4 text-base font-semibold rounded-xl backdrop-blur-xl transition-all relative group border-2"
                >
                  <span className="relative z-10 flex items-center gap-2 text-white">
                    Talk to a Specialist
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                </MotionGhostButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
