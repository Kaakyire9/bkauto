"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PrimaryButton from "./ui/PrimaryButton";
import GhostButton from "./ui/GhostButton";

export default function Hero() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  // Try to programmatically play the video (some browsers block autoplay unless muted and programmatic play is used)
  useEffect(() => {
    if (reducedMotion) return;
    const v = videoRef.current;
    if (!v) return;
    // ensure muted and try to play
    v.muted = true;
    const playPromise = v.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.then(() => {
        setAutoplayBlocked(false);
      }).catch(() => {
        setAutoplayBlocked(true);
      });
    }
  }, [reducedMotion]);

  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen h-[60vh] md:h-[70vh] overflow-hidden transition-all duration-500 ease-in-out">

      {/* Background Video or Poster */}
      {reducedMotion ? (
        <div className="absolute inset-0">
          <Image src="/images/hero-poster.jpg" alt="Hero poster" fill className="object-cover" priority />
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
            src="/videos/hero-video.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />

          {autoplayBlocked && (
            <div className="absolute inset-0 z-30 flex items-center justify-center">
              <button
                onClick={async () => {
                  const v = videoRef.current;
                  if (!v) return;
                  try {
                    v.muted = true;
                    await v.play();
                    setAutoplayBlocked(false);
                  } catch (err) {
                    // still blocked — keep the overlay
                  }
                }}
                className="flex items-center gap-3 bg-black/60 text-white px-5 py-3 rounded-full backdrop-blur-sm shadow-lg hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-gold"
                aria-label="Play background video"
              >
                <span className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full transition-transform transform hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gold">
                    <path d="M4.5 3.5v17l15-8.5-15-8.5z" />
                  </svg>
                </span>
                <span className="font-semibold">Play</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hero Content */}
      <div className="relative w-full h-full flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white safe-area-x transition-opacity duration-500">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            Find your next car — we source, you decide.
          </h1>

          <p className="text-lg sm:text-xl mb-8 text-neutral-200 max-w-2xl">
            Place an order and receive offers from trusted sellers across our network. 
            Inspection, shipping, and transparent fees included.
          </p>

          <div className="flex gap-4">
            <Link href="/order">
              <PrimaryButton>Order Now</PrimaryButton>
            </Link>
            <Link href="/how-it-works">
              <GhostButton>How it works</GhostButton>
            </Link>
          </div>

          <p className="mt-6 text-sm text-neutral-300">
            No inventory — we find offers for your specification. Secure payments and insured shipping.
          </p>
        </div>
      </div>
    </section>
  );
}
