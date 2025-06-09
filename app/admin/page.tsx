'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart, Download, Users, Image, Video, ArrowLeft, Trash2, Music, FileText } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatFileSize, isImageFile, isVideoFile, isAudioFile } from '@/lib/utils'
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
    if (item.file_name === 'Message Only') return <Heart className="w-5 h-5 text-rose-500" />
    if (isImageFile(item.file_name)) return <Image className="w-5 h-5 text-blue-500" />
    if (isVideoFile(item.file_name)) return <Video className="w-5 h-5 text-purple-500" />
    if (isAudioFile(item.file_name)) return <Music className="w-5 h-5 text-green-500" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const getFileTypeLabel = (item: MediaFile) => {
    if (item.file_name === 'Message Only') return 'Message'
    if (isImageFile(item.file_name)) return 'Photo'
    if (isVideoFile(item.file_name)) return 'Video'
    if (isAudioFile(item.file_name)) return 'Audio'
    return 'File'
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
  const videoCount = media.filter(item => isVideoFile(item.file_name)).length
  const audioCount = media.filter(item => isAudioFile(item.file_name)).length
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
              <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  {item.file_name === 'Message Only' ? (
                    <div className="w-full h-48 bg-gradient-to-br from-rose-50 to-rose-100 flex flex-col items-center justify-center">
                      <Heart className="w-12 h-12 text-rose-400 mb-2" />
                      <p className="text-sm font-medium text-rose-600">Message</p>
                    </div>
                  ) : isImageFile(item.file_name) ? (
                    <img
                      src={item.file_path}
                      alt={item.file_name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      {getFileIcon(item)}
                    </div>
                  )}
                  
                  {/* Delete button */}
                  <button
                    onClick={() => deleteMedia(item.id)}
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
    </div>
  )
}