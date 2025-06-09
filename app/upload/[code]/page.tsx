'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { FileUpload } from '@/components/FileUpload'
import { Camera, Heart, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Event {
  id: string
  name: string
  date: string
}

export default function UploadPage() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from('events')
          .select('id, name, date')
          .eq('access_code', params.code)
          .single()

        if (supabaseError) throw supabaseError
        
        setEvent(data)
      } catch (err) {
        setError('Event not found. Please check your link.')
        console.error('Error fetching event:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.code) {
      fetchEvent()
    }
  }, [params.code])

  const handleUploadComplete = () => {
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 5000)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">!</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Event Not Found</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {uploadSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">Files uploaded successfully! Thank you for sharing your memories.</p>
          </div>
        )}

        {/* Event Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-wedding-400 to-rose-400 rounded-full">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            {event.name}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-500">
            Share your photos, videos, and wishes with the happy couple!
          </p>
        </div>

        {/* Upload Interface */}
        <Card className="animate-slide-up">
          <CardHeader>
            <h2 className="text-2xl font-serif font-semibold text-center text-gray-900 flex items-center justify-center">
              <Heart className="w-6 h-6 mr-2 text-rose-500" />
              Share Your Memories
            </h2>
            <p className="text-center text-gray-600">
              Upload photos, videos, voice messages, or leave a written wish
            </p>
          </CardHeader>
          <CardContent>
            <FileUpload 
              eventId={event.id} 
              onUploadComplete={handleUploadComplete}
            />
          </CardContent>
        </Card>

        {/* Thank You Message */}
        <div className="mt-8 text-center bg-gradient-to-r from-wedding-50 to-rose-50 rounded-xl p-6">
          <Heart className="w-8 h-8 text-rose-500 mx-auto mb-3" />
          <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
            Thank You for Being Part of This Special Day!
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your photos and messages mean the world to the happy couple. 
            Every memory you share helps make their wedding day even more special.
          </p>
        </div>
      </div>
    </div>
  )
}