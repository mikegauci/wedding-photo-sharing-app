import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { primaryFont, gorgeousFont, scriptFont, headingsFont } from './fonts'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })

export const metadata: Metadata = {
  title: "Celebrate Your Memories With Us - The Wedding of Roberta and Michael",
  description: "Celebrate Your Memories With Us - The Wedding of Roberta and Michael",
  icons: {
    icon: "/favicon.ico",
  },
};

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