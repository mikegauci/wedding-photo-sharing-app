'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart, Download, Users, Image, Video, ArrowLeft, Trash2, Music, FileText, Mic, X, Play, Pause } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatFileSize, isImageFile, isVideoFile, isAudioFile, isVoiceMessage } from '@/lib/utils'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

interface MediaFile {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  uploaded_by: string | null
  message: string | null
  created_at: string
}


const WEDDING_DETAILS = {
  id: process.env.NEXT_PUBLIC_WEDDING_ID || 'roberta-michael-wedding',
  name: process.env.NEXT_PUBLIC_WEDDING_NAME || "Roberta & Michael's Wedding",
  date: process.env.NEXT_PUBLIC_WEDDING_DATE || "June 21, 2025"
}

export default function AdminPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [previewItem, setPreviewItem] = useState<MediaFile | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchMedia()
    }
  }, [isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    
    try {
      const response = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsAuthenticated(true)
      } else {
        setAuthError('Incorrect password')
      }
    } catch (error) {
      setAuthError('Authentication failed. Please try again.')
    }
  }

  const fetchMedia = async () => {
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('event_id', WEDDING_DETAILS.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', id)

      if (error) throw error
      setMedia(media.filter(m => m.id !== id))
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Failed to delete file')
    }
  }

  const downloadAll = async () => {
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
      saveAs(content, `${WEDDING_DETAILS.name}-memories.zip`)
    } catch (error) {
      console.error('Error creating ZIP file:', error)
      alert('Failed to download files. Please try again.')
    } finally {
      setDownloadLoading(false)
    }
  }

  const getFileIcon = (item: MediaFile) => {
    if (item.file_name === 'Message Only') return <Heart className="w-12 h-12 text-rose-400" />
    if (isVoiceMessage(item.file_name, item.file_type)) return <Mic className="w-12 h-12 text-green-400" />
    if (isImageFile(item.file_name)) return <Image className="w-12 h-12 text-blue-400" />
    if (isVideoFile(item.file_name)) return <Video className="w-12 h-12 text-purple-400" />
    if (isAudioFile(item.file_name)) return <Music className="w-12 h-12 text-green-400" />
    return <FileText className="w-12 h-12 text-gray-400" />
  }

  const getFileTypeLabel = (item: MediaFile) => {
    if (item.file_name === 'Message Only') return 'Message'
    if (isVoiceMessage(item.file_name, item.file_type)) return 'Voice Message'
    if (isImageFile(item.file_name)) return 'Photo'
    if (isVideoFile(item.file_name)) return 'Video'
    if (isAudioFile(item.file_name)) return 'Audio'
    return 'File'
  }

  const getFileBackground = (item: MediaFile) => {
    if (item.file_name === 'Message Only') return 'bg-gradient-to-br from-rose-50 to-rose-100'
    if (isVoiceMessage(item.file_name, item.file_type)) return 'bg-gradient-to-br from-green-50 to-green-100'
    if (isImageFile(item.file_name)) return 'bg-gradient-to-br from-blue-50 to-blue-100'
    if (isVideoFile(item.file_name)) return 'bg-gradient-to-br from-purple-50 to-purple-100'
    if (isAudioFile(item.file_name)) return 'bg-gradient-to-br from-green-50 to-green-100'
    return 'bg-gradient-to-br from-gray-50 to-gray-100'
  }

  const openPreview = (item: MediaFile) => {
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-wedding-50 to-rose-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-wedding-400 to-rose-400 rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-script font-bold text-sage-900">Wedding Admin</h1>
            <p className="text-gray-600">Enter password to access dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                {authError && (
                  <p className="text-red-600 text-sm mt-2">{authError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
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

  const photoCount = media.filter(item => isImageFile(item.file_name)).length
  const videoCount = media.filter(item => 
    !isVoiceMessage(item.file_name, item.file_type) && isVideoFile(item.file_name)
  ).length
  const audioCount = media.filter(item => 
    isVoiceMessage(item.file_name, item.file_type) || 
    (!isVideoFile(item.file_name) && isAudioFile(item.file_name))
  ).length
  const messageCount = media.filter(item => item.message).length

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-wedding-50 to-rose-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button 
            onClick={() => setIsAuthenticated(false)}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
          >
            Logout
          </Button>
        </div>

        {/* Event Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-script font-bold text-sage-900 mb-2">
            {WEDDING_DETAILS.name}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {new Date(WEDDING_DETAILS.date).toLocaleDateString('en-US', { 
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
              onClick={downloadAll}
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
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No uploads yet
              </h3>
              <p className="text-gray-600">
                Share your upload link with guests to start collecting memories!
              </p>
                             <div className="mt-4">
                 <Link href="/">
                   <Button>
                     Go to Homepage
                   </Button>
                 </Link>
               </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
              <Card 
                key={item.id} 
                className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openPreview(item)}
              >
                <div className="relative">
                  {item.file_name === 'Message Only' ? (
                    <div className={`w-full h-48 ${getFileBackground(item)} flex flex-col items-center justify-center`}>
                      {getFileIcon(item)}
                      <p className="text-sm font-medium text-rose-600 mt-2">Message</p>
                    </div>
                  ) : isImageFile(item.file_name) ? (
                    <img
                      src={item.file_path}
                      alt={item.file_name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className={`w-full h-48 ${getFileBackground(item)} flex items-center justify-center`}>
                      {getFileIcon(item)}
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMedia(item.id)
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {getFileTypeLabel(item)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(item.file_size)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {item.file_name}
                  </p>
                  
                  {item.uploaded_by && (
                    <p className="text-xs text-gray-500 mb-1">
                      By: {item.uploaded_by}
                    </p>
                  )}
                  
                  {item.message && (
                    <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded">
                      "{item.message}"
                    </p>
                  )}
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {previewItem && (
        <PreviewModal />
      )}
    </div>
  )
}