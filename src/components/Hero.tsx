"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PrimaryButton from "./ui/PrimaryButton";
import GhostButton from "./ui/GhostButton";

export default function Hero() {
  const [reducedMotion, setReducedMotion] = useState(false);

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

  return (
    <section className="relative left-1/2 -translate-x-1/2 w-screen h-[60vh] md:h-[70vh] overflow-hidden transition-all duration-500 ease-in-out">

      {/* Background Video or Poster */}
      {reducedMotion ? (
        <div className="absolute inset-0">
          <Image src="/images/hero-poster.jpg" alt="Hero poster" fill className="object-cover" priority />
        </div>
      ) : (
        <video
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
          src="/videos/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
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
