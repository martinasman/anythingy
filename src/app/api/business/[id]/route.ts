import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Allowed fields that can be updated via PATCH
const ALLOWED_FIELDS = [
  'business_name',
  'tagline',
  'brand_colors',
  'brand_voice',
  'logo_url',
  'business_canvas',
  'market_research',
  'website_structure',
  'customer_journey',
  'automation_flows',
] as const

type AllowedField = (typeof ALLOWED_FIELDS)[number]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching business:', error)
    return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: 'Business ID is required' }, { status: 400 })
  }

  try {
    const body = await request.json()

    // Filter to only allowed fields
    const updates: Partial<Record<AllowedField, unknown>> = {}
    for (const key of Object.keys(body)) {
      if (ALLOWED_FIELDS.includes(key as AllowedField)) {
        updates[key as AllowedField] = body[key]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating business:', error)
      return NextResponse.json(
        { error: 'Failed to update business' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error parsing request:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
