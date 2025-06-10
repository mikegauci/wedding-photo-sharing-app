'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Download, Image, Video, Music, FileText, Calendar, Users, Heart, Mic, X, Play, Pause } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatFileSize, isImageFile, isVideoFile, isAudioFile, isVoiceMessage } from '@/lib/utils'
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
  const [previewItem, setPreviewItem] = useState<Media | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

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
    if (item.file_name === 'Message Only') return <Heart className="w-12 h-12 text-rose-400" />
    if (isVoiceMessage(item.file_name, item.file_type)) return <Mic className="w-12 h-12 text-green-400" />
    if (isImageFile(item.file_name)) return <Image className="w-12 h-12 text-blue-400" />
    if (isVideoFile(item.file_name)) return <Video className="w-12 h-12 text-purple-400" />
    if (isAudioFile(item.file_name)) return <Music className="w-12 h-12 text-green-400" />
    return <FileText className="w-12 h-12 text-gray-400" />
  }

  const getFileTypeLabel = (item: Media) => {
    if (item.file_name === 'Message Only') return 'Message'
    if (isVoiceMessage(item.file_name, item.file_type)) return 'Voice Message'
    if (isImageFile(item.file_name)) return 'Photo'
    if (isVideoFile(item.file_name)) return 'Video'
    if (isAudioFile(item.file_name)) return 'Audio'
    return 'File'
  }

  const getFileBackground = (item: Media) => {
    if (item.file_name === 'Message Only') return 'border-l-4 border-rose-400 bg-rose-50'
    if (isVoiceMessage(item.file_name, item.file_type)) return 'border-l-4 border-green-400 bg-green-50'
    if (isImageFile(item.file_name)) return 'border-l-4 border-blue-400 bg-blue-50'
    if (isVideoFile(item.file_name)) return 'border-l-4 border-purple-400 bg-purple-50'
    if (isAudioFile(item.file_name)) return 'border-l-4 border-green-400 bg-green-50'
    return 'border-l-4 border-gray-400 bg-gray-50'
  }

  const openPreview = (item: Media) => {
    setPreviewItem(item)
    setIsPlaying(false)
  }

  const closePreview = () => {
    setPreviewItem(null)
    setIsPlaying(false)
  }

  const PreviewModal = () => {
    if (!previewItem) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto relative">
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 z-10 bg-gray-800 text-white rounded-full p-2 hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              {getFileIcon(previewItem)}
              <div className="ml-3">
                <h3 className="text-lg font-semibold">{getFileTypeLabel(previewItem)}</h3>
                <p className="text-sm text-gray-600">{previewItem.file_name}</p>
              </div>
            </div>

            {/* Preview Content */}
            <div className="mb-4">
              {previewItem.file_name === 'Message Only' ? (
                <div className="bg-rose-50 p-6 rounded-lg text-center">
                  <Heart className="w-16 h-16 text-rose-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-rose-600 mb-2">Message</h4>
                  {previewItem.message && (
                    <p className="text-gray-700 text-lg">"{previewItem.message}"</p>
                  )}
                </div>
              ) : isImageFile(previewItem.file_name) ? (
                <img
                  src={previewItem.file_path}
                  alt={previewItem.file_name}
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              ) : isVideoFile(previewItem.file_name) ? (
                <video
                  src={previewItem.file_path}
                  controls
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              ) : (isVoiceMessage(previewItem.file_name, previewItem.file_type) || isAudioFile(previewItem.file_name)) ? (
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <Mic className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-green-600 mb-4">
                    {isVoiceMessage(previewItem.file_name, previewItem.file_type) ? 'Voice Message' : 'Audio File'}
                  </h4>
                  <audio
                    src={previewItem.file_path}
                    controls
                    className="mx-auto"
                  />
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">File preview not available</p>
                  <a
                    href={previewItem.file_path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download to view
                  </a>
                </div>
              )}
            </div>

            {/* File Details */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">File Size:</span>
                <span className="text-sm text-gray-600">{formatFileSize(previewItem.file_size)}</span>
              </div>
              {previewItem.uploaded_by && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Uploaded by:</span>
                  <span className="text-sm text-gray-600">{previewItem.uploaded_by}</span>
                </div>
              )}
              {previewItem.message && previewItem.file_name !== 'Message Only' && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Message:</span>
                  <span className="text-sm text-gray-600 italic">"{previewItem.message}"</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium">Date:</span>
                <span className="text-sm text-gray-600">{new Date(previewItem.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
  const videoCount = media.filter(item => 
    !isVoiceMessage(item.file_name, item.file_type) && isVideoFile(item.file_name)
  ).length
  const audioCount = media.filter(item => 
    isVoiceMessage(item.file_name, item.file_type) || 
    (!isVideoFile(item.file_name) && isAudioFile(item.file_name))
  ).length
  const messageCount = media.filter(item => item.file_name === 'Message Only').length

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
              <Mic className="w-6 h-6 text-green-500 mx-auto mb-2" />
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
              <Card 
                key={item.id} 
                className={`${getFileBackground(item)} hover:shadow-lg transition-shadow cursor-pointer`}
                onClick={() => openPreview(item)}
              >
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
      {previewItem && <PreviewModal />}
    </div>
  )
}