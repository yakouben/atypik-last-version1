import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [CLIENT-BOOKINGS] Starting client booking retrieval...');
    
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Step 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ [CLIENT-BOOKINGS] Auth error:', authError);
      return NextResponse.json({ 
        error: 'Authentication error',
        details: authError?.message || 'No user found'
      }, { status: 401 });
    }

    console.log('✅ [CLIENT-BOOKINGS] User authenticated:', user.id);

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const debug = searchParams.get('debug') === 'true';

    // Validate clientId
    if (!clientId) {
      console.error('❌ [CLIENT-BOOKINGS] Missing clientId parameter');
      return NextResponse.json({ 
        error: 'Client ID is required',
      }, { status: 400 });
    }

    // Security check: ensure the requesting user can only access their own bookings
    if (clientId !== user.id) {
      console.error('❌ [CLIENT-BOOKINGS] Unauthorized access attempt:', {
        requestedClientId: clientId,
        authenticatedUserId: user.id
      });
      return NextResponse.json({ 
        error: 'Unauthorized: You can only access your own bookings',
      }, { status: 403 });
    }

    console.log('🔍 [CLIENT-BOOKINGS] Fetching bookings for client:', clientId);

    // Fetch bookings for the specific client with property details
    const { data: bookings, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        properties (
          id,
          name,
          location,
          images,
          price_per_night,
          category,
          owner_id
        )
      `)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ [CLIENT-BOOKINGS] Error fetching bookings:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch bookings',
          details: fetchError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ [CLIENT-BOOKINGS] Raw bookings fetched:', bookings?.length || 0);

    // Transform the data to match the expected structure in your component
    const transformedBookings = bookings?.map((booking) => {
      console.log('🔄 [CLIENT-BOOKINGS] Transforming booking:', booking.id);
      
      const propertyData = booking.properties || {};
      
      return {
        id: booking.id,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        total_price: booking.total_price,
        status: booking.status,
        guest_count: booking.guest_count,
        special_requests: booking.special_requests,
        full_name: booking.full_name,
        email_or_phone: booking.email_or_phone,
        travel_type: booking.travel_type,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        // Property data in the format expected by your component
        properties: {
          id: propertyData.id || booking.property_id,
          name: propertyData.name || booking.property_name || 'Unknown Property',
          location: propertyData.location || booking.property_location || 'Unknown Location',
          images: propertyData.images || booking.property_images || [],
          price_per_night: propertyData.price_per_night || booking.property_price_per_night || 0,
          category: propertyData.category || 'autre',
          owner_id: propertyData.owner_id
        }
      };
    }) || [];

    console.log('✅ [CLIENT-BOOKINGS] Transformed bookings:', transformedBookings.length);

    // Enhanced debug information
    if (debug) {
      console.log('🔍 [CLIENT-BOOKINGS] Debug info:', {
        clientId,
        totalBookings: transformedBookings.length,
        bookingStatuses: transformedBookings.reduce((acc, booking) => {
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        latestBooking: transformedBookings[0] || null,
        timestamp: new Date().toISOString()
      });
    }

    const response = NextResponse.json({ 
      data: transformedBookings,
      count: transformedBookings.length,
      debug: debug ? {
        clientId,
        totalBookings: transformedBookings.length,
        timestamp: new Date().toISOString(),
        bookingStatuses: transformedBookings.reduce((acc, booking) => {
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      } : undefined
    });

    // Add cache headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error) {
    console.error('❌ [CLIENT-BOOKINGS] Exception in client bookings API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
