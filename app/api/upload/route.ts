import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Fixed wedding details - no events table needed
const WEDDING_DETAILS = {
  id: 'roberta-michael-wedding',
  name: "Roberta & Michael's Wedding",
  date: '2025-06-21'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const guestName = formData.get('guestName') as string
    const message = formData.get('message') as string
    const messageOnly = formData.get('messageOnly') as string

    // Handle message-only submissions
    if (messageOnly === 'true') {
      if (!message?.trim() && !guestName?.trim()) {
        return NextResponse.json(
          { error: 'Please provide either a name or message' },
          { status: 400 }
        )
      }

      // Save message-only record to database
      const { error: dbError } = await supabase
        .from('media')
        .insert([
          {
            event_id: WEDDING_DETAILS.id,
            file_name: 'Message Only',
            file_path: '',
            file_type: 'text/plain',
            file_size: 0,
            uploaded_by: guestName || null,
            message: message || null
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
        return NextResponse.json(
          { error: 'Failed to save message' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, messageOnly: true })
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Check if file has a valid name
    if (!file.name || typeof file.name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid file - missing file name' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop() || 'bin'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${WEDDING_DETAILS.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('wedding-media')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wedding-media')
      .getPublicUrl(filePath)

    // Save media record to database
    const { error: dbError } = await supabase
      .from('media')
      .insert([
        {
          event_id: WEDDING_DETAILS.id,
          file_name: file.name,
          file_path: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: guestName || null,
          message: message || null
        }
      ])

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to save file record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}