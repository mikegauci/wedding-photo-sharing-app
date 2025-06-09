import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function generateAccessCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function isImageFile(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

export function isVideoFile(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

export function isAudioFile(filename: string): boolean {
  if (!filename || typeof filename !== 'string') return false
  const audioExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.webm']
  return audioExtensions.some(ext => filename.toLowerCase().endsWith(ext))
}

export function isVoiceMessage(filename: string, fileType?: string): boolean {
  if (!filename || typeof filename !== 'string') return false
  return filename.includes('voice-message-') || fileType === 'audio/webm'
}