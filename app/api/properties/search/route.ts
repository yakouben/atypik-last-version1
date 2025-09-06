import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const published = searchParams.get('published') === 'true';
    const available = searchParams.get('available') === 'true';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');

    console.log('🔍 Search API - Query:', { query, published, available, minPrice, maxPrice, location });

    // First, let's check what columns exist in the properties table
    const { data: columns, error: columnsError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);

    if (columnsError) {
      console.error('❌ Search API - Error checking table structure:', columnsError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de la structure de la table', details: columnsError.message },
        { status: 500 }
      );
    }

    console.log('🔍 Search API - Table structure check:', Object.keys(columns?.[0] || {}));

    // Build the query based on actual column names
    let supabaseQuery = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    // Add filters based on actual column names
    if (published) {
      // Check if published column exists, otherwise use is_published
      const hasPublished = columns?.[0] && 'published' in columns[0];
      const hasIsPublished = columns?.[0] && 'is_published' in columns[0];
      
      if (hasPublished) {
        supabaseQuery = supabaseQuery.eq('published', true);
      } else if (hasIsPublished) {
        supabaseQuery = supabaseQuery.eq('is_published', true);
      }
    }

    if (available) {
      // Check if available column exists, otherwise use is_available
      const hasAvailable = columns?.[0] && 'available' in columns[0];
      const hasIsAvailable = columns?.[0] && 'is_available' in columns[0];
      
      if (hasAvailable) {
        supabaseQuery = supabaseQuery.eq('available', true);
      } else if (hasIsAvailable) {
        supabaseQuery = supabaseQuery.eq('is_available', true);
      }
    }

    if (minPrice) {
      supabaseQuery = supabaseQuery.gte('price_per_night', parseInt(minPrice));
    }

    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte('price_per_night', parseInt(maxPrice));
    }

    // Text search for name and location
    if (query.trim()) {
      // Use a simpler search approach that works with Supabase
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,location.ilike.%${query}%`);
    }

    if (location) {
      supabaseQuery = supabaseQuery.ilike('location', `%${location}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('❌ Search API - Database error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la recherche', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Search API - Results found:', data?.length || 0);
    console.log('🔍 Search API - Sample result:', data?.[0]);

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('❌ Search API - Unexpected error:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
