import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { encryptKey } from '@/lib/encryption'

// POST: Connect user's Supabase project
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { supabaseUrl, anonKey, serviceRoleKey } = body

    // Validate inputs
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: 'Supabase URL and anon key are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
      return NextResponse.json(
        { error: 'Invalid Supabase URL format. Expected: https://xxxxx.supabase.co' },
        { status: 400 }
      )
    }

    // Test the connection with the provided credentials
    try {
      const testClient = createSupabaseClient(supabaseUrl, anonKey)
      // Try a simple query to verify connection
      const { error: testError } = await testClient.from('_test_connection').select('*').limit(1)

      // We expect an error since the table doesn't exist, but NOT an auth error
      if (testError && testError.message.includes('Invalid API key')) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your anon key.' },
          { status: 400 }
        )
      }
    } catch (connError) {
      return NextResponse.json(
        { error: 'Failed to connect to Supabase. Please check your credentials.' },
        { status: 400 }
      )
    }

    // Encrypt the keys
    const encryptedAnonKey = encryptKey(anonKey)
    const encryptedServiceRoleKey = serviceRoleKey ? encryptKey(serviceRoleKey) : null

    // Check if user already has a connection
    const { data: existing } = await supabase
      .from('user_supabase_connections')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('user_supabase_connections')
        .update({
          supabase_url: supabaseUrl,
          supabase_anon_key_encrypted: encryptedAnonKey,
          supabase_service_role_key_encrypted: encryptedServiceRoleKey,
          status: 'active',
          last_verified_at: new Date().toISOString(),
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update connection' },
          { status: 500 }
        )
      }
    } else {
      // Create new connection
      const { error: insertError } = await supabase
        .from('user_supabase_connections')
        .insert({
          user_id: user.id,
          supabase_url: supabaseUrl,
          supabase_anon_key_encrypted: encryptedAnonKey,
          supabase_service_role_key_encrypted: encryptedServiceRoleKey,
          status: 'active',
          last_verified_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json(
          { error: 'Failed to save connection' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase project connected successfully',
    })
  } catch (error) {
    console.error('Connection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Get current connection status
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: connection, error } = await supabase
      .from('user_supabase_connections')
      .select('id, supabase_url, status, last_verified_at, error_message, schema_version, created_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch connection' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      connected: !!connection,
      connection: connection || null,
    })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Disconnect Supabase project
export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('user_supabase_connections')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Delete error:', error)
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase project disconnected',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
