'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Download, Image, Video, Music, FileText, Calendar, Users, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatFileSize, isImageFile, isVideoFile, isAudioFile } from '@/lib/utils'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface Event {
  id: string
  name: string
  date: string
  created_at: string
}

interface Media {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string | null
  message: string | null
  created_at: string
}

export default function AdminDashboard() {
  const params = useParams()
  const [event, setEvent] = useState<Event | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEventAndMedia = async () => {
      try {
        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, name, date, created_at')
          .eq('admin_code', params.code)
          .single()

        if (eventError) throw eventError
        
        setEvent(eventData)

        // Fetch media for this event
        const { data: mediaData, error: mediaError } = await supabase
          .from('media')
          .select('*')
          .eq('event_id', eventData.id)
          .order('created_at', { ascending: false })

        if (mediaError) throw mediaError
        
        setMedia(mediaData || [])
      } catch (err) {
        setError('Event not found or invalid admin code.')
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.code) {
      fetchEventAndMedia()
    }
  }, [params.code])

  const downloadAllMedia = async () => {
    if (media.length === 0) return

    setDownloadLoading(true)
    
    try {
      const zip = new JSZip()
      
      for (const item of media) {
        try {
          // Handle message-only entries
          if (item.file_name === 'Message Only') {
            // Create text content from message and guest info
            let textContent = ''
            if (item.uploaded_by) {
              textContent += `From: ${item.uploaded_by}\n`
            }
            if (item.message) {
              textContent += `Message: ${item.message}\n`
            }
            textContent += `Date: ${new Date(item.created_at).toLocaleString()}\n`
            
            // Create a meaningful filename with timestamp
            const timestamp = new Date(item.created_at).toISOString().split('T')[0]
            const guestName = item.uploaded_by ? item.uploaded_by.replace(/[^a-zA-Z0-9]/g, '_') : 'Guest'
            const fileName = `Message_${guestName}_${timestamp}.txt`
            
            // Add text file to ZIP
            zip.file(fileName, textContent)
          } else {
            // Handle regular files
            const response = await fetch(item.file_path)
            if (response.ok) {
              const blob = await response.blob()
              zip.file(item.file_name, blob)
            }
          }
        } catch (error) {
          console.error(`Failed to download ${item.file_name}:`, error)
        }
      }

      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${event?.name || 'Wedding'}-memories.zip`)
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      alert('Failed to download files. Please try again.')
    } finally {
      setDownloadLoading(false)
    }
  }

  const getFileIcon = (item: Media) => {
    if (item.file_name === 'Message Only') return <Heart className="w-5 h-5 text-rose-500" />
    if (isImageFile(item.file_name)) return <Image className="w-5 h-5 text-blue-500" />
    if (isVideoFile(item.file_name)) return <Video className="w-5 h-5 text-purple-500" />
    if (isAudioFile(item.file_name)) return <Music className="w-5 h-5 text-green-500" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const getFileTypeLabel = (item: Media) => {
    if (item.file_name === 'Message Only') return 'Message'
    if (isImageFile(item.file_name)) return 'Photo'
    if (isVideoFile(item.file_name)) return 'Video'
    if (isAudioFile(item.file_name)) return 'Audio'
    return 'File'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) return null

  const photoCount = media.filter(item => isImageFile(item.file_name)).length
  const videoCount = media.filter(item => isVideoFile(item.file_name)).length
  const audioCount = media.filter(item => isAudioFile(item.file_name)).length
  const messageCount = media.filter(item => item.message).length

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Event Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            {event.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <Image className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{photoCount}</p>
              <p className="text-sm text-gray-600">Photos</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <Video className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">{videoCount}</p>
              <p className="text-sm text-gray-600">Videos</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <Music className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{audioCount}</p>
              <p className="text-sm text-gray-600">Audio</p>
            </div>
            <div className="bg-rose-50 rounded-lg p-4">
              <Heart className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-600">{messageCount}</p>
              <p className="text-sm text-gray-600">Messages</p>
            </div>
          </div>

          {media.length > 0 && (
            <Button 
              onClick={downloadAllMedia}
              disabled={downloadLoading}
              size="lg"
              className="mb-8"
            >
              <Download className="w-5 h-5 mr-2" />
              {downloadLoading ? 'Preparing Download...' : `Download All (${media.length} files)`}
            </Button>
          )}
        </div>

        {/* Media Grid */}
        {media.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No uploads yet
              </h3>
              <p className="text-gray-600">
                Share your event link with guests to start collecting memories!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(item)}
                      <span className="text-sm font-medium text-gray-700">
                        {getFileTypeLabel(item)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(item.file_size)}
                    </span>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-2 break-words">
                    {item.file_name}
                  </h3>

                  {item.uploaded_by && (
                    <p className="text-sm text-gray-600 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Uploaded by: {item.uploaded_by}
                    </p>
                  )}

                  {item.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700">"{item.message}"</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={item.file_path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-wedding-600 hover:text-wedding-700 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}