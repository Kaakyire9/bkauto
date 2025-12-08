"use client"
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, Props>(function PrimaryButton({ children, className, ...rest }, ref) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md bg-deep-red text-white hover:bg-cherry-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-bk-gold/40'
  return (
    <button ref={ref} className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </button>
  )
});

export default PrimaryButton;
