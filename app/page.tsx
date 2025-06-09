'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Heart, Camera, Upload, CheckCircle, Calendar } from 'lucide-react'
import { FileUpload } from '@/components/FileUpload'

export default function HomePage() {
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  const weddingDetails = {
    coupleNames: "Roberta & Michael",
    weddingDate: "June 21, 2025",
    venue: "TBD"
  }

  const handleUploadComplete = () => {
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 5000)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 bg-gradient-to-br from-cream-50 to-sage-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-sage-400 to-sage-500 rounded-full shadow-lg">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-primary font-medium text-sage-900 mb-4 uppercase tracking-wider">
            <div className="flex flex-col items-center space-y-2">
              <span>ROBERTA</span>
              <span className="text-6xl md:text-8xl font-script normal-case tracking-normal">and</span>
              <span>MICHAEL</span>
            </div>
          </h1>
          
          <div className="flex justify-center items-center mb-6 text-xl text-sage-700">
            <Calendar className="w-5 h-5 mr-2" />
            {weddingDetails.weddingDate}
          </div>
          
          <p className="text-xl text-sage-700 mb-12 max-w-2xl mx-auto">
            Help us capture every precious moment of our special day! 
            Share your photos, videos, and well-wishes with us.
          </p>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {uploadSuccess && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in max-w-2xl mx-auto">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <p className="text-green-800">Files uploaded successfully! Thank you for sharing your memories with us. ❤️</p>
            </div>
          )}

          {/* Upload Interface */}
          <Card className="bg-white shadow-xl max-w-4xl mx-auto">
            <CardHeader className="px-8 pt-8 pb-6">
              <h2 className="text-5xl md:text-6xl font-script text-center text-sage-900 flex items-center justify-center mb-4">
                Share Your Memories
              </h2>
              <p className="text-center text-sage-700 text-lg">
                Upload photos, videos, voice messages, or leave a written message for us
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <FileUpload onUploadComplete={handleUploadComplete} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gradient-to-br from-cream-50 to-sage-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-script text-center text-sage-900 flex items-center justify-center mb-4">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
                  <Camera className="w-8 h-8 text-sage-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">1. Capture</h3>
              <p className="text-sage-700">Take photos and videos throughout our wedding day</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
                  <Upload className="w-8 h-8 text-sage-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">2. Upload</h3>
              <p className="text-sage-700">Use the form above to share your photos with us!</p>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full">
                  <Heart className="w-8 h-8 text-sage-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">3. Cherish</h3>
              <p className="text-sage-700">We'll treasure these memories forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Message */}
      <section className="py-16 px-4 bg-cream-50">
        <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-script text-center text-sage-900 flex items-center justify-center mb-4">
            A Message From Us
          </h2>
          <p className="text-lg text-sage-800 mb-6 leading-relaxed">
            Your presence at our wedding means the world to us. We'd love to see our special day 
            through your eyes! Please share any photos, videos, or messages you'd like - 
            every moment you capture helps tell the story of our perfect day.
          </p>
          <p className="text-base text-sage-700 italic">
            With love and gratitude,<br />
            {weddingDetails.coupleNames} 💕
          </p>
        </div>
      </section>
    </div>
  )
}