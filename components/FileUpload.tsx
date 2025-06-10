'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText, Image, Video, Music, Mic, MessageSquare, Camera } from 'lucide-react'
import { Button } from './ui/Button'
import { formatFileSize, isImageFile, isVideoFile, isAudioFile, isVoiceMessage } from '@/lib/utils'
import { VoiceRecorder } from './VoiceRecorder'

interface FileUploadProps {
  eventId?: string
  onUploadComplete?: () => void
}

interface UploadFile {
  file: File
  id: string
  progress: number
  uploaded: boolean
  error?: string
}

type ActionType = 'send-message' | 'record-voice' | 'upload-media' | null

export function FileUpload({ eventId, onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [message, setMessage] = useState('')
  const [selectedAction, setSelectedAction] = useState<ActionType>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(originalFile => ({
      file: originalFile,
      id: Math.random().toString(36).substring(2, 15),
      progress: 0,
      uploaded: false
    }))
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const handleVoiceRecording = useCallback((audioBlob: Blob, duration: number) => {
    // Create a File object from the audio blob
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fileName = `voice-message-${timestamp}.webm`
    const voiceFile = new File([audioBlob], fileName, { type: 'audio/webm' })
    
    const newFile: UploadFile = {
      file: voiceFile,
      id: Math.random().toString(36).substring(2, 15),
      progress: 0,
      uploaded: false
    }
    
    setFiles(prev => [...prev, newFile])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm']
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
        if (eventId) {
          formData.append('eventId', eventId)
        }
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
          setSelectedAction(null)
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
        if (eventId) {
          formData.append('eventId', eventId)
        }
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
    if (isVoiceMessage(uploadFile.file.name, uploadFile.file.type)) {
      return <Mic className="w-5 h-5 text-red-500" />
    }
    if (isAudioFile(uploadFile.file.name)) return <Music className="w-5 h-5 text-green-500" />
    return <FileText className="w-5 h-5 text-gray-500" />
  }

  const getDisplayName = (uploadFile: UploadFile) => {
    if (isVoiceMessage(uploadFile.file.name, uploadFile.file.type)) {
      return 'Voice Message'
    }
    return uploadFile.file.name
  }

  const resetForm = () => {
    setSelectedAction(null)
    setFiles([])
    setGuestName('')
    setMessage('')
  }

  return (
    <div className="space-y-6">
      {/* Action Selection Buttons */}
      {!selectedAction ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedAction('send-message')}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer group"
          >
            <MessageSquare className="w-12 h-12 text-sage-600 mb-4 group-hover:text-sage-700" />
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Send Message</h3>
            <p className="text-sm text-gray-600 text-center">Write a heartfelt message for the couple</p>
          </button>

          <button
            onClick={() => setSelectedAction('record-voice')}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer group"
          >
            <Mic className="w-12 h-12 text-sage-600 mb-4 group-hover:text-sage-700" />
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Record Voice Message</h3>
            <p className="text-sm text-gray-600 text-center">Record a personal voice message</p>
          </button>

          <button
            onClick={() => setSelectedAction('upload-media')}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-sage-400 hover:bg-sage-50 transition-all duration-200 cursor-pointer group"
          >
            <Camera className="w-12 h-12 text-sage-600 mb-4 group-hover:text-sage-700" />
            <h3 className="text-lg font-semibold text-sage-900 mb-2">Upload Image/Video</h3>
            <p className="text-sm text-gray-600 text-center">Share photos and videos from the day</p>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Button */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-sage-900">
              {selectedAction === 'send-message' && 'Send Message'}
              {selectedAction === 'record-voice' && 'Record Voice Message'}
              {selectedAction === 'upload-media' && 'Upload Image/Video'}
            </h3>
            <Button
              onClick={resetForm}
              variant="outline"
              size="sm"
            >
              ← Back to Options
            </Button>
          </div>

          {/* Name Field (Always Present) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            />
          </div>

          {/* Send Message Section */}
          {selectedAction === 'send-message' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a wish, memory, or heartfelt message..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Record Voice Message Section */}
          {selectedAction === 'record-voice' && (
            <div>
              <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
            </div>
          )}

          {/* Upload Image/Video Section */}
          {selectedAction === 'upload-media' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive 
                  ? 'border-sage-500 bg-sage-50' 
                  : 'border-gray-300 hover:border-sage-400 hover:bg-gray-50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive ? 'Drop files here' : 'Tap to select your photos & videos'}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Max file size: 50MB
              </p>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Selected Files</h3>
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getDisplayName(file)}</p>
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
          {((selectedAction === 'send-message' && message.trim()) || 
            (selectedAction === 'record-voice' && files.length > 0) || 
            (selectedAction === 'upload-media' && files.length > 0)) && (
            <Button 
              onClick={submitData} 
              disabled={uploading || (files.length > 0 && files.every(f => f.uploaded))}
              className="w-full"
              size="lg"
            >
              {uploading 
                ? selectedAction === 'send-message' ? 'Sending...' : 'Uploading...'
                : selectedAction === 'send-message' 
                  ? 'Send Message'
                  : files.length > 0 
                    ? files.some(f => f.uploaded) 
                      ? 'Upload More' 
                      : selectedAction === 'record-voice' ? 'Send Voice Message' : 'Upload Files'
                    : 'Send Memory'
              }
            </Button>
          )}
        </div>
      )}
    </div>
  )
}