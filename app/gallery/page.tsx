'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Camera, Heart, ArrowLeft, Download, Users, Image, Video } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface MediaFile {
  id: string
  file_name: string
  file_url: string
  file_type: string
  uploaded_at: string
  guest_name?: string
}

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null)

  // TODO: Replace with your actual wedding details
  const weddingDetails = {
    coupleNames: "Sarah & Michael",
    weddingDate: "June 15, 2024",
    eventId: "wedding-2024"
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      // This would fetch from your specific wedding event
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('event_id', weddingDetails.eventId)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const isImage = (fileType: string) => fileType.startsWith('image/')
  const isVideo = (fileType: string) => fileType.startsWith('video/')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading memories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-wedding-50 to-rose-50">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-wedding-400 to-rose-400 rounded-full shadow-lg">
              <Camera className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-2">
            Our Wedding Memories
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {weddingDetails.coupleNames}
          </p>
          <p className="text-lg text-gray-500 mb-4">
            {weddingDetails.weddingDate}
          </p>
          
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {media.length} memories shared
            </div>
            <div className="flex items-center">
              <Image className="w-4 h-4 mr-1" />
              {media.filter(m => isImage(m.file_type)).length} photos
            </div>
            <div className="flex items-center">
              <Video className="w-4 h-4 mr-1" />
              {media.filter(m => isVideo(m.file_type)).length} videos
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {media.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No memories yet</h3>
              <p className="text-gray-600 mb-6">
                Be the first to share a photo or video from the wedding!
              </p>
              <Link href="/upload">
                <Button>
                  <Camera className="w-4 h-4 mr-2" />
                  Share a Memory
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedMedia(item)}
              >
                {isImage(item.file_type) ? (
                  <img
                    src={item.file_url}
                    alt={item.file_name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : isVideo(item.file_type) ? (
                  <div className="relative w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <div className="w-0 h-0 border-l-4 border-l-gray-800 border-y-2 border-y-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <Download className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">{item.file_name}</p>
                    </div>
                  </div>
                )}
                
                <div className="p-3">
                  <p className="text-sm text-gray-600 truncate">{item.file_name}</p>
                  {item.guest_name && (
                    <p className="text-xs text-gray-500">by {item.guest_name}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(item.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-12 text-center">
          <Card className="bg-white/60 backdrop-blur-sm inline-block">
            <CardContent className="p-6">
              <Heart className="w-8 h-8 text-rose-500 mx-auto mb-3" />
              <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">
                Share More Memories
              </h3>
              <p className="text-gray-600 mb-4">
                Help us collect more beautiful moments from our special day
              </p>
              <Link href="/upload">
                <Button size="lg">
                  <Camera className="w-5 h-5 mr-2" />
                  Upload Photos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for viewing selected media */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            {isImage(selectedMedia.file_type) ? (
              <img
                src={selectedMedia.file_url}
                alt={selectedMedia.file_name}
                className="max-w-full max-h-[80vh] object-contain"
              />
            ) : isVideo(selectedMedia.file_type) ? (
              <video
                src={selectedMedia.file_url}
                controls
                className="max-w-full max-h-[80vh]"
              />
            ) : (
              <div className="p-8 text-center">
                <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">{selectedMedia.file_name}</p>
                <Button onClick={() => window.open(selectedMedia.file_url, '_blank')}>
                  Download File
                </Button>
              </div>
            )}
            <div className="p-4 border-t">
              <p className="font-medium">{selectedMedia.file_name}</p>
              {selectedMedia.guest_name && (
                <p className="text-sm text-gray-600">Shared by {selectedMedia.guest_name}</p>
              )}
              <p className="text-sm text-gray-500">
                {new Date(selectedMedia.uploaded_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 