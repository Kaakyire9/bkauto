"use client"
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

const GhostButton = React.forwardRef<HTMLButtonElement, Props>(function GhostButton({ children, className, ...rest }, ref) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md border border-brand-deep-navy text-brand-deep-navy hover:bg-brand-deep-navy/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-deep-navy/40'
  return (
    <button ref={ref} className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </button>
  )
});

export default GhostButton;
