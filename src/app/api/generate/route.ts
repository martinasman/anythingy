import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Create business record
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        prompt: prompt.trim(),
        status: 'pending',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create business' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
