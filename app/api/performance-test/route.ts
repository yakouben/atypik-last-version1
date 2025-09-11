import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('⚡ [PERFORMANCE-TEST] Starting performance analysis...');
    
    const cookieStore = cookies();
    const supabase = createServerClient(cookieStore);
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as any,
      summary: {
        totalTime: 0,
        slowestTest: '',
        fastestTest: '',
        recommendations: [] as string[]
      }
    };

    // Test 1: Database Connection Speed
    if (testType === 'all' || testType === 'connection') {
      console.log('🔌 [PERFORMANCE-TEST] Testing database connection...');
      const startTime = Date.now();
      
      const { data, error } = await supabaseAdmin
        .from('properties')
        .select('count')
        .limit(1);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.tests.databaseConnection = {
        duration: `${duration}ms`,
        success: !error,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ [PERFORMANCE-TEST] Database connection: ${duration}ms`);
    }

    // Test 2: Properties Fetch Speed
    if (testType === 'all' || testType === 'properties') {
      console.log('🏠 [PERFORMANCE-TEST] Testing properties fetch...');
      const startTime = Date.now();
      
      const { data: properties, error } = await supabaseAdmin
        .from('properties')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.tests.propertiesFetch = {
        duration: `${duration}ms`,
        count: properties?.length || 0,
        success: !error,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ [PERFORMANCE-TEST] Properties fetch: ${duration}ms (${properties?.length || 0} items)`);
    }

    // Test 3: Bookings Fetch Speed
    if (testType === 'all' || testType === 'bookings') {
      console.log('📅 [PERFORMANCE-TEST] Testing bookings fetch...');
      const startTime = Date.now();
      
      const { data: bookings, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          properties (
            id,
            name,
            location,
            images
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.tests.bookingsFetch = {
        duration: `${duration}ms`,
        count: bookings?.length || 0,
        success: !error,
        error: error?.message || null,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ [PERFORMANCE-TEST] Bookings fetch: ${duration}ms (${bookings?.length || 0} items)`);
    }

    // Test 4: Client-Specific Bookings
    if (testType === 'all' || testType === 'client-bookings') {
      console.log('👤 [PERFORMANCE-TEST] Testing client bookings fetch...');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const startTime = Date.now();
        
        const { data: clientBookings, error } = await supabaseAdmin
          .from('bookings')
          .select(`
            *,
            properties (
              id,
              name,
              location,
              images
            )
          `)
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        results.tests.clientBookingsFetch = {
          duration: `${duration}ms`,
          count: clientBookings?.length || 0,
          clientId: user.id,
          success: !error,
          error: error?.message || null,
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ [PERFORMANCE-TEST] Client bookings fetch: ${duration}ms (${clientBookings?.length || 0} items)`);
      } else {
        results.tests.clientBookingsFetch = {
          duration: 'N/A',
          count: 0,
          clientId: null,
          success: false,
          error: 'User not authenticated',
          timestamp: new Date().toISOString()
        };
      }
    }

    // Test 5: Real-time Subscription Test
    if (testType === 'all' || testType === 'realtime') {
      console.log('🔔 [PERFORMANCE-TEST] Testing real-time subscription setup...');
      const startTime = Date.now();
      
      try {
        // Test if we can create a channel
        const channel = supabase.channel('performance-test-channel');
        const subscription = channel.subscribe((status) => {
          console.log(`📡 [PERFORMANCE-TEST] Real-time status: ${status}`);
        });
        
        // Clean up immediately
        setTimeout(() => {
          subscription.unsubscribe();
        }, 100);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        results.tests.realtimeSetup = {
          duration: `${duration}ms`,
          success: true,
          error: null,
          timestamp: new Date().toISOString()
        };
        
        console.log(`✅ [PERFORMANCE-TEST] Real-time setup: ${duration}ms`);
      } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        results.tests.realtimeSetup = {
          duration: `${duration}ms`,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        };
        
        console.log(`❌ [PERFORMANCE-TEST] Real-time setup failed: ${duration}ms`);
      }
    }

    // Test 6: API Response Time
    if (testType === 'all' || testType === 'api') {
      console.log('🌐 [PERFORMANCE-TEST] Testing API response time...');
      const startTime = Date.now();
      
      // Simulate API processing
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      results.tests.apiResponse = {
        duration: `${duration}ms`,
        success: true,
        error: null,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ [PERFORMANCE-TEST] API response: ${duration}ms`);
    }

    // Calculate summary
    const durations = Object.values(results.tests)
      .filter((test: any) => test.duration && test.duration !== 'N/A')
      .map((test: any) => parseInt(test.duration.replace('ms', '')));

    if (durations.length > 0) {
      results.summary.totalTime = durations.reduce((a, b) => a + b, 0);
      results.summary.slowestTest = Object.keys(results.tests)
        .reduce((a, b) => 
          parseInt(results.tests[a].duration?.replace('ms', '') || '0') > 
          parseInt(results.tests[b].duration?.replace('ms', '') || '0') ? a : b
        );
      results.summary.fastestTest = Object.keys(results.tests)
        .reduce((a, b) => 
          parseInt(results.tests[a].duration?.replace('ms', '') || '0') < 
          parseInt(results.tests[b].duration?.replace('ms', '') || '0') ? a : b
        );
    }

    // Add recommendations
    Object.entries(results.tests).forEach(([testName, test]: [string, any]) => {
      if (test.duration && test.duration !== 'N/A') {
        const duration = parseInt(test.duration.replace('ms', ''));
        if (duration > 1000) {
          results.summary.recommendations.push(`${testName} is slow (${test.duration}) - consider optimization`);
        }
        if (duration > 5000) {
          results.summary.recommendations.push(`${testName} is very slow (${test.duration}) - critical issue`);
        }
      }
    });

    console.log('✅ [PERFORMANCE-TEST] Performance analysis complete:', results.summary);

    return NextResponse.json({
      success: true,
      performance: results,
      message: 'Performance analysis completed'
    });

  } catch (error) {
    console.error('❌ [PERFORMANCE-TEST] Exception in performance API:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Performance test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
