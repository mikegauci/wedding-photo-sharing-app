import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-sage-500 text-white hover:bg-sage-600 focus:ring-sage-500 shadow-lg hover:shadow-xl',
    secondary: 'bg-cream-500 text-sage-900 hover:bg-cream-600 focus:ring-cream-500 shadow-lg hover:shadow-xl',
    outline: 'border-2 border-sage-500 text-sage-500 hover:bg-sage-50 focus:ring-sage-500',
    ghost: 'text-sage-600 hover:bg-sage-100 focus:ring-sage-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}