'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Square, Trash2 } from 'lucide-react'
import { Button } from './ui/Button'
import { formatFileSize } from '@/lib/utils'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' })
        const url = URL.createObjectURL(blob)
        
        setAudioBlob(blob)
        setAudioUrl(url)
        setDuration(recordingTime)
        
        // Clean up stream
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not start recording. Please check your microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioUrl(null)
    setAudioBlob(null)
    setDuration(0)
    setRecordingTime(0)
    setIsPlaying(false)
  }

  const useRecording = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob, duration)
      deleteRecording()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="border-2 border-dashed border-sage-300 rounded-xl p-6 bg-sage-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2 mb-2">
          <Mic className="w-5 h-5 text-sage-600" />
          <h3 className="text-lg font-medium text-sage-900">Record Voice Message</h3>
        </div>

        {!audioUrl && !isRecording && (
          <Button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-600 font-medium">Recording...</span>
            </div>
            <div className="text-2xl font-mono text-sage-900 mb-4">
              {formatTime(recordingTime)}
            </div>
            <Button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop Recording
            </Button>
          </div>
        )}

        {audioUrl && (
          <div className="w-full max-w-sm">
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            
            <div className="bg-white p-4 rounded-lg border border-sage-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-sage-700">Voice Message</span>
                <span className="text-xs text-sage-500">
                  {formatTime(duration)} • {audioBlob ? formatFileSize(audioBlob.size) : ''}
                </span>
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={isPlaying ? pauseRecording : playRecording}
                  variant="outline"
                  size="sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={useRecording}
                  className="bg-sage-600 hover:bg-sage-700 text-white"
                  size="sm"
                >
                  Use Recording
                </Button>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-sage-500 text-center">
          Click "Start Recording" to record a voice message for the couple
        </p>
      </div>
    </div>
  )
} 