"use client"
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode
}

export default function PrimaryButton({ children, className, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center px-4 py-2 rounded-md bg-secondary text-white hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary/50'
  return (
    <button className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </button>
  )
}
