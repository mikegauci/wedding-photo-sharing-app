import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { primaryFont, gorgeousFont, scriptFont, headingsFont } from './fonts'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: 'WeddingShare - Share Your Wedding Memories',
  description: 'A beautiful way for wedding guests to share photos, videos, and messages',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${primaryFont.variable} ${gorgeousFont.variable} ${scriptFont.variable} ${headingsFont.variable}`}>
      <body className="font-primary bg-gradient-to-br from-cream-50 to-sage-100 min-h-screen">
        <main>{children}</main>
      </body>
    </html>
  )
}