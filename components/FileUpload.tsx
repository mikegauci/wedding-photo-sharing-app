'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, Video, Music } from 'lucide-react'
import { Button } from './ui/Button'
import { formatFileSize, isImageFile, isVideoFile, isAudioFile } from '@/lib/utils'

interface FileUploadProps {
  eventId: string
  onUploadComplete?: () => void
}

interface UploadFile {
  file: File
  id: string
  progress: number
  uploaded: boolean
  error?: string
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(originalFile => ({
      file: originalFile,
      id: Math.random().toString(36).substring(2, 15),
      progress: 0,
      uploaded: false
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg']
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const submitData = async () => {
    setUploading(true)
    
    // If no files, just submit the message
    if (files.length === 0) {
      try {
        const formData = new FormData()
        formData.append('guestName', guestName)
        formData.append('message', message)
        formData.append('messageOnly', 'true')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          // Clear the form after successful message submission
          setGuestName('')
          setMessage('')
          if (onUploadComplete) {
            onUploadComplete()
          }
        } else {
          const errorData = await response.json()
          alert(errorData.error || 'Failed to send')
        }
      } catch (error) {
        alert('Failed to send')
      }
      setUploading(false)
      return
    }

    // Handle file uploads
    for (const file of files) {
      if (file.uploaded) continue

      try {
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('guestName', guestName)
        formData.append('message', message)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, uploaded: true, progress: 100 } : f
          ))
        } else {
          const errorData = await response.json()
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { ...f, error: errorData.error || 'Upload failed' } : f
          ))
        }
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, error: 'Upload failed' } : f
        ))
      }
    }

    setUploading(false)
    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  const getFileIcon = (uploadFile: UploadFile) => {
    if (isImageFile(uploadFile.file.name)) return <Image className="w-5 h-5 text-blue-500" />
    if (isVideoFile(uploadFile.file.name)) return <Video className="w-5 h-5 text-purple-500" />
    if (isAudioFile(uploadFile.file.name)) return <Music className="w-5 h-5 text-green-500" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Guest Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (Optional)
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share a wish or memory"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-wedding-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive 
            ? 'border-wedding-500 bg-wedding-50' 
            : 'border-gray-300 hover:border-wedding-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          {isDragActive ? 'Drop files here' : 'Tap to select your photos & videos'}
        </p>
        <p className="text-sm text-gray-500">
          Photos, videos, and audio files welcome
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Max file size: 50MB
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Selected Files</h3>
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getFileIcon(file)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.file.size)}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center space-x-2">
                  {file.uploaded && (
                    <span className="text-green-600 text-sm font-medium">✓ Uploaded</span>
                  )}
                  {file.error && (
                    <span className="text-red-600 text-sm">{file.error}</span>
                  )}
                  {!file.uploaded && (
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {file.uploaded && (
                  <p className="text-xs text-green-600 italic">
                    Thank you for sharing this memory! 💕
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {(files.length > 0 || message.trim()) && (
        <Button 
          onClick={submitData} 
          disabled={uploading || (files.length > 0 && files.every(f => f.uploaded))}
          className="w-full"
          size="lg"
        >
          {uploading 
            ? files.length > 0 ? 'Uploading...' : 'Sending...'
            : files.length > 0 
              ? files.some(f => f.uploaded) 
                ? 'Upload More' 
                : 'Upload Files'
              : 'Send Memory'
          }
        </Button>
      )}
    </div>
  )
}