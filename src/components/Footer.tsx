"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: "About Us", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Our Story", href: "/story" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" }
    ],
    services: [
      { label: "Place Order", href: "/order" },
      { label: "Vehicle Sourcing", href: "/services/sourcing" },
      { label: "Inspection", href: "/services/inspection" },
      { label: "Shipping", href: "/services/shipping" },
      { label: "Concierge", href: "/services/concierge" }
    ],
    support: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Pricing", href: "/pricing" },
      { label: "Track Order", href: "/track" }
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Disclaimer", href: "/disclaimer" }
    ]
  };

  const socialLinks = [
    { 
      name: "Facebook", 
      href: "https://facebook.com", 
      icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
      color: "#1877F2"
    },
    { 
      name: "Twitter", 
      href: "https://twitter.com", 
      icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z",
      color: "#1DA1F2"
    },
    { 
      name: "Instagram", 
      href: "https://instagram.com", 
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
      color: "#E4405F"
    },
    { 
      name: "LinkedIn", 
      href: "https://linkedin.com", 
      icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
      color: "#0077B5"
    },
    { 
      name: "YouTube", 
      href: "https://youtube.com", 
      icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
      color: "#FF0000"
    },
    { 
      name: "TikTok", 
      href: "https://tiktok.com", 
      icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.10-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
      color: "#000000"
    }
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Subscribe:", email);
    setEmail("");
  };

  return (
    <footer className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] py-24 lg:py-32 overflow-hidden bg-[#041123] text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] rounded-full opacity-[0.015] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/4 w-[700px] h-[700px] rounded-full opacity-[0.015] blur-3xl"
          style={{
            background: 'radial-gradient(circle, #1257D8 0%, transparent 70%)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />
      </div>

      {/* Decorative Top Border */}
      <div className="relative h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-8 lg:px-12 pt-20 pb-12">
        {/* Top Section - Brand & Newsletter */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16 pb-16 border-b border-[#D4AF37]/10">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/" className="inline-flex items-center gap-4 mb-6 group">
              <motion.div 
                className="relative w-16 h-16"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] via-[#1257D8] to-[#C21E3A] opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-full" />
                <Image
                  src="/images/bk-logo1.png"
                  alt="BK Auto Trading"
                  fill
                  className="object-contain relative z-10"
                  sizes="64px"
                />
              </motion.div>
              <div>
                <span 
                  className="block text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #C6CDD1 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 20px rgba(0, 0, 0, 0.9)'
                  }}
                >
                  BK AUTO TRADING
                </span>
              </div>
            </Link>
            
            <p 
              className="text-[#C6CDD1] leading-relaxed mb-6 max-w-md font-medium"
              style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)' }}
            >
              Your trusted partner in premium automotive sourcing. We source exclusive vehicles from our global network of verified sellers.
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "500+ Vehicles", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "98% Satisfaction", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
                { label: "Global Network", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(18, 87, 216, 0.05))',
                    borderColor: 'rgba(212, 175, 55, 0.2)'
                  }}
                >
                  <svg className="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={badge.icon} />
                  </svg>
                  <span className="text-xs text-[#C6CDD1] font-medium">{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:pl-12"
          >
            <h3 
              className="text-2xl font-bold mb-4"
              style={{
                color: '#FFFFFF',
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.9)'
              }}
            >
              Stay Updated
            </h3>
            <p 
              className="text-[#C6CDD1] mb-6 font-medium"
              style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)' }}
            >
              Subscribe to our newsletter for exclusive offers, new arrivals, and automotive insights.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-6 py-4 rounded-xl text-white placeholder-[#C6CDD1]/50 backdrop-blur-xl border-2 transition-all focus:outline-none focus:border-[#D4AF37]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(4, 17, 35, 0.95))',
                    borderColor: 'rgba(212, 175, 55, 0.2)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                  }}
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 text-sm font-semibold text-[#041123] rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, #D4AF37 0%, #886f1d 100%)',
                    boxShadow: '0 5px 20px rgba(212, 175, 55, 0.4)'
                  }}
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-xs text-[#C6CDD1]/60">
                By subscribing, you agree to our Privacy Policy and consent to receive updates.
              </p>
            </form>

            {/* Social Media */}
            <div className="mt-8">
              <h4 
                className="text-sm font-semibold mb-4 tracking-wider"
                style={{
                  color: '#D4AF37',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)'
                }}
              >
                FOLLOW US
              </h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseEnter={() => setHoveredSocial(social.name)}
                    onMouseLeave={() => setHoveredSocial(null)}
                    whileHover={{ scale: 1.1, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl border-2 transition-all group"
                    style={{
                      background: hoveredSocial === social.name 
                        ? `linear-gradient(135deg, ${social.color}20, rgba(4, 17, 35, 0.95))`
                        : 'linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(4, 17, 35, 0.95))',
                      borderColor: hoveredSocial === social.name ? social.color + '40' : 'rgba(212, 175, 55, 0.2)',
                      boxShadow: hoveredSocial === social.name ? `0 10px 30px ${social.color}40` : 'none'
                    }}
                  >
                    <svg 
                      className="w-5 h-5 relative z-10 transition-colors"
                      style={{ 
                        color: hoveredSocial === social.name ? social.color : '#C6CDD1'
                      }}
                      fill="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                    
                    {hoveredSocial === social.name && (
                      <motion.div
                        layoutId="socialGlow"
                        className="absolute inset-0 rounded-xl blur-xl -z-10"
                        style={{
                          background: `radial-gradient(circle, ${social.color}40, transparent)`
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Links Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <h4 
                className="text-sm font-bold mb-4 tracking-wider uppercase"
                style={{
                  color: '#D4AF37',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)'
                }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[#C6CDD1] hover:text-[#D4AF37] transition-colors text-sm font-medium group inline-flex items-center gap-2"
                      style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.9)' }}
                    >
                      <span className="w-1 h-1 rounded-full bg-[#D4AF37] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 border-t border-[#D4AF37]/10"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p 
              className="text-sm text-[#C6CDD1]/70 font-medium"
              style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.9)' }}
            >
              © {currentYear} BK Auto Trading. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6">
              <Link 
                href="/privacy" 
                className="text-sm text-[#C6CDD1]/70 hover:text-[#D4AF37] transition-colors font-medium"
                style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.9)' }}
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-[#C6CDD1]/70 hover:text-[#D4AF37] transition-colors font-medium"
                style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.9)' }}
              >
                Terms
              </Link>
              <Link 
                href="/cookies" 
                className="text-sm text-[#C6CDD1]/70 hover:text-[#D4AF37] transition-colors font-medium"
                style={{ textShadow: '0 1px 5px rgba(0, 0, 0, 0.9)' }}
              >
                Cookies
              </Link>
            </div>
          </div>

          {/* Crafted with love badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-[#C6CDD1]/50 inline-flex items-center gap-2">
              Crafted with 
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-[#C21E3A]"
              >
                ♥
              </motion.span>
              for automotive enthusiasts
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Accent Line */}
      <div className="relative h-1">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C21E3A] via-[#D4AF37] to-[#1257D8] opacity-30" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#C21E3A] via-[#D4AF37] to-[#1257D8]"
          animate={{ x: ['0%', '100%', '0%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </footer>
  );
}
