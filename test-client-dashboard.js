// Test script to check client dashboard reservations fetching
const testClientDashboard = async () => {
  console.log('🧪 Testing Client Dashboard Reservations Fetching...\n');
  
  try {
    // Test 1: Check if the API endpoint is accessible
    console.log('1️⃣ Testing API endpoint accessibility...');
    const response = await fetch('/api/debug-client');
    
    if (!response.ok) {
      console.error('❌ API endpoint not accessible:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API endpoint accessible');
    console.log('📊 Debug data:', JSON.stringify(data, null, 2));
    
    // Test 2: Check if user is authenticated
    if (!data.debug?.user) {
      console.error('❌ User not authenticated');
      return;
    }
    
    console.log('✅ User authenticated:', data.debug.user.email);
    
    // Test 3: Check if user has a profile
    if (!data.debug?.profile) {
      console.error('❌ User profile not found');
      return;
    }
    
    console.log('✅ User profile found:', data.debug.profile.full_name);
    
    // Test 4: Check bookings data
    const bookings = data.debug?.bookings || [];
    console.log(`✅ Found ${bookings.length} bookings`);
    
    if (bookings.length > 0) {
      console.log('📋 Sample booking:', JSON.stringify(bookings[0], null, 2));
    } else {
      console.log('ℹ️ No bookings found for this user');
    }
    
    // Test 5: Test the actual client bookings API
    console.log('\n2️⃣ Testing client bookings API...');
    const clientResponse = await fetch(`/api/bookings/client?clientId=${data.debug.user.id}&debug=true`);
    
    if (!clientResponse.ok) {
      console.error('❌ Client bookings API failed:', clientResponse.status);
      return;
    }
    
    const clientData = await clientResponse.json();
    console.log('✅ Client bookings API working');
    console.log('📊 Client bookings data:', JSON.stringify(clientData, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testClientDashboard();
