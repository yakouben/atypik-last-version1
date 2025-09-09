// Create a simple test page for production debugging
// This will be accessible via URL on your production site

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Check environment variables
    const envCheck = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Missing',
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configured' : '❌ Missing',
    };
    
    // Get user profile
    const { data: profile, error: profileError } = user ? await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() : { data: null, error: null };

    // Get client bookings
    const { data: bookings, error: bookingsError } = user ? await supabase
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
      .order('created_at', { ascending: false }) : { data: null, error: null };

    // Check if properties table exists
    const { data: propertiesCount, error: propertiesError } = await supabase
      .from('properties')
      .select('id', { count: 'exact' });

    // Create HTML response
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Debug - AtypikHouse</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .section { margin: 20px 0; padding: 15px; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        h1 { color: #333; text-align: center; }
        h2 { color: #666; margin-top: 30px; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .status { font-weight: bold; }
        .timestamp { color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Production Debug Report</h1>
        <p class="timestamp">Generated at: ${new Date().toISOString()}</p>
        
        <div class="section ${envCheck.supabaseUrl.includes('✅') ? 'success' : 'error'}">
            <h2>1️⃣ Environment Variables</h2>
            <p><strong>Supabase URL:</strong> ${envCheck.supabaseUrl}</p>
            <p><strong>Supabase Anon Key:</strong> ${envCheck.supabaseAnonKey}</p>
            <p><strong>Service Role Key:</strong> ${envCheck.serviceRoleKey}</p>
        </div>
        
        <div class="section ${user ? 'success' : 'error'}">
            <h2>2️⃣ Authentication</h2>
            ${user ? `
                <p><strong>Status:</strong> ✅ User authenticated</p>
                <p><strong>User ID:</strong> ${user.id}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Created:</strong> ${user.created_at}</p>
            ` : `
                <p><strong>Status:</strong> ❌ User not authenticated</p>
                <p><strong>Error:</strong> ${authError?.message || 'No user found'}</p>
            `}
        </div>
        
        <div class="section ${profile ? 'success' : 'warning'}">
            <h2>3️⃣ User Profile</h2>
            ${profile ? `
                <p><strong>Status:</strong> ✅ Profile found</p>
                <p><strong>Name:</strong> ${profile.full_name}</p>
                <p><strong>User Type:</strong> ${profile.user_type}</p>
                <p><strong>Email:</strong> ${profile.email}</p>
            ` : `
                <p><strong>Status:</strong> ⚠️ Profile not found</p>
                <p><strong>Error:</strong> ${profileError?.message || 'No profile found'}</p>
            `}
        </div>
        
        <div class="section ${bookingsError ? 'error' : 'info'}">
            <h2>4️⃣ Client Bookings</h2>
            ${bookingsError ? `
                <p><strong>Status:</strong> ❌ Database error</p>
                <p><strong>Error:</strong> ${bookingsError.message}</p>
            ` : `
                <p><strong>Status:</strong> ✅ Database connection working</p>
                <p><strong>Bookings Found:</strong> ${bookings?.length || 0}</p>
                ${bookings && bookings.length > 0 ? `
                    <h3>Sample Booking:</h3>
                    <pre>${JSON.stringify(bookings[0], null, 2)}</pre>
                ` : '<p>No bookings found for this user.</p>'}
            `}
        </div>
        
        <div class="section ${propertiesError ? 'error' : 'info'}">
            <h2>5️⃣ Database Tables</h2>
            ${propertiesError ? `
                <p><strong>Status:</strong> ❌ Properties table error</p>
                <p><strong>Error:</strong> ${propertiesError.message}</p>
            ` : `
                <p><strong>Status:</strong> ✅ Properties table accessible</p>
                <p><strong>Properties Count:</strong> ${propertiesCount?.length || 0}</p>
            `}
        </div>
        
        <div class="section info">
            <h2>6️⃣ Recommendations</h2>
            ${!user ? '<p>🔑 <strong>Action:</strong> Make sure you are logged in to test bookings</p>' : ''}
            ${envCheck.supabaseUrl.includes('❌') ? '<p>🔧 <strong>Action:</strong> Configure Supabase environment variables on your hosting platform</p>' : ''}
            ${bookingsError ? '<p>🗄️ <strong>Action:</strong> Check RLS policies and database schema in Supabase</p>' : ''}
            ${bookings && bookings.length === 0 && user ? '<p>📝 <strong>Note:</strong> User has no bookings - this might be normal if no reservations were made</p>' : ''}
        </div>
        
        <div class="section info">
            <h2>7️⃣ Next Steps</h2>
            <p>1. If environment variables are missing, add them to your hosting platform</p>
            <p>2. If RLS policies are missing, run the SQL scripts in your Supabase dashboard</p>
            <p>3. If database schema is incomplete, run the migration scripts</p>
            <p>4. Test the client dashboard after fixing the issues</p>
        </div>
    </div>
</body>
</html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    const errorHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Debug Error - AtypikHouse</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; border-radius: 5px; }
        h1 { color: #333; text-align: center; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>❌ Production Debug Error</h1>
        <div class="error">
            <h2>Error Details:</h2>
            <pre>${error instanceof Error ? error.message : 'Unknown error'}</pre>
        </div>
    </div>
</body>
</html>
    `;

    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}
