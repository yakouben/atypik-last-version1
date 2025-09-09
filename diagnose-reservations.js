// Production vs Localhost Diagnostic Script
// Run this in your browser console on both localhost and production

const diagnoseReservationsIssue = async () => {
  console.log('🔍 DIAGNOSING RESERVATIONS ISSUE');
  console.log('=====================================\n');
  
  try {
    // Test 1: Environment Variables
    console.log('1️⃣ Testing Environment Variables...');
    const envResponse = await fetch('/api/debug-env');
    const envData = await envResponse.json();
    console.log('Environment Status:', envData);
    
    if (envData.environment?.NEXT_PUBLIC_SUPABASE_URL === 'Missing') {
      console.error('❌ CRITICAL: Supabase URL not configured in production!');
      return;
    }
    
    // Test 2: Authentication Status
    console.log('\n2️⃣ Testing Authentication...');
    const authResponse = await fetch('/api/debug-client');
    const authData = await authResponse.json();
    
    if (!authData.debug?.user) {
      console.error('❌ User not authenticated');
      console.log('💡 Solution: Make sure you are logged in');
      return;
    }
    
    console.log('✅ User authenticated:', authData.debug.user.email);
    
    // Test 3: Database Connection
    console.log('\n3️⃣ Testing Database Connection...');
    if (authData.debug?.bookingsError) {
      console.error('❌ Database error:', authData.debug.bookingsError);
      console.log('💡 Solution: Check Supabase connection and RLS policies');
      return;
    }
    
    console.log('✅ Database connection working');
    
    // Test 4: RLS Policies
    console.log('\n4️⃣ Testing RLS Policies...');
    const bookings = authData.debug?.bookings || [];
    console.log(`Found ${bookings.length} bookings`);
    
    if (bookings.length === 0) {
      console.log('⚠️ No bookings found - this could be normal if user has no reservations');
      console.log('💡 Check if user should have bookings in the database');
    }
    
    // Test 5: Client API Specific Test
    console.log('\n5️⃣ Testing Client Bookings API...');
    const clientResponse = await fetch(`/api/bookings/client?clientId=${authData.debug.user.id}&debug=true`);
    const clientData = await clientResponse.json();
    
    if (!clientResponse.ok) {
      console.error('❌ Client API failed:', clientResponse.status, clientData);
      return;
    }
    
    console.log('✅ Client API working');
    console.log('Client bookings count:', clientData.count);
    
    // Test 6: Compare with expected data
    console.log('\n6️⃣ Data Analysis...');
    console.log('User ID:', authData.debug.user.id);
    console.log('Profile:', authData.debug.profile);
    console.log('Bookings:', clientData.data?.length || 0);
    
    if (clientData.debug) {
      console.log('Debug info:', clientData.debug);
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
};

// Run the diagnostic
diagnoseReservationsIssue();
