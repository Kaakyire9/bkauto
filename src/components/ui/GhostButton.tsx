"use client"
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export default function GhostButton({ children, className, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md border border-brand text-brand hover:bg-brand/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand/40'
  return (
    <button className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </button>
  )
}
