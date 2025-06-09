'use client'

import React, { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { Button } from './ui/Button'
import { Download, Share2 } from 'lucide-react'

interface QRCodeGeneratorProps {
  url: string
  title: string
}

export function QRCodeGenerator({ url, title }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  useEffect(() => {
    const generateQR = async () => {
      try {
        const qrDataUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(qrDataUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    if (url) {
      generateQR()
    }
  }, [url])

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `${title}-qrcode.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  const shareUrl = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(url)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {qrCodeUrl && (
          <img 
            src={qrCodeUrl} 
            alt="QR Code" 
            className="border-4 border-white shadow-lg rounded-lg"
          />
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 break-all bg-gray-50 p-3 rounded-lg">
          {url}
        </p>
        
        <div className="flex justify-center space-x-3">
          <Button onClick={downloadQR} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download QR
          </Button>
          <Button onClick={shareUrl} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>
      </div>
    </div>
  )
}