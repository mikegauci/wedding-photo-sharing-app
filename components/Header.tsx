import React from 'react'
import Link from 'next/link'
import { Heart, Camera } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-cream-50 shadow-sm border-b border-sage-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-serif font-bold text-sage-900">
              WeddingShare
            </span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-sage-700 hover:text-sage-600 transition-colors">
              Home
            </Link>
            <Link href="/admin" className="text-sage-700 hover:text-sage-600 transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}