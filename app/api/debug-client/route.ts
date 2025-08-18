import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        error: 'Unauthorized',
        authError: authError?.message,
        user: null
      }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    // Get client bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        check_in_date,
        check_out_date,
        total_price,
        status,
        guest_count,
        special_requests,
        full_name,
        email_or_phone,
        travel_type,
        created_at,
        updated_at,
        properties (
          id,
          name,
          location,
          images
        )
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    // Check if properties table exists and has data
    const { data: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('id', { count: 'exact' });

    return NextResponse.json({
      success: true,
      debug: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile: profile ? {
          id: profile.id,
          full_name: profile.full_name,
          user_type: profile.user_type,
          email: profile.email
        } : null,
        profileError: profileError?.message,
        bookings: bookings || [],
        bookingsCount: bookings?.length || 0,
        bookingsError: bookingsError?.message,
        propertiesCount: propertiesCount?.length || 0,
        propertiesError: propertiesError?.message,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in debug-client API:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 