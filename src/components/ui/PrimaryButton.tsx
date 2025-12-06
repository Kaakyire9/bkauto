"use client"
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export default function PrimaryButton({ children, className, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md bg-cta-cherry text-white hover:bg-cta-cherry-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cta-cherry/40'
  return (
    <button className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </button>
  )
}
