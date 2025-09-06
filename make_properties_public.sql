-- SQL to make properties visible to everyone but require authentication for booking
-- This allows public access to view properties but redirects to login for booking

-- 1. Update RLS policies to allow public read access to published properties
DROP POLICY IF EXISTS "Allow public read access to published properties" ON properties;

CREATE POLICY "Allow public read access to published properties" ON properties
FOR SELECT
USING (
  published = true 
  AND available = true
);

-- 2. Ensure the properties table has the correct structure
-- Check if columns exist, if not add them
DO $$
BEGIN
  -- Add published column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'published') THEN
    ALTER TABLE properties ADD COLUMN published BOOLEAN DEFAULT false;
  END IF;
  
  -- Add available column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'available') THEN
    ALTER TABLE properties ADD COLUMN available BOOLEAN DEFAULT true;
  END IF;
  
  -- Add price_per_night column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'price_per_night') THEN
    ALTER TABLE properties ADD COLUMN price_per_night DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  -- Add location column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'location') THEN
    ALTER TABLE properties ADD COLUMN location TEXT DEFAULT '';
  END IF;
  
  -- Add description column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'description') THEN
    ALTER TABLE properties ADD COLUMN description TEXT DEFAULT '';
  END IF;
  
  -- Add images column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'properties' AND column_name = 'images') THEN
    ALTER TABLE properties ADD COLUMN images TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- 3. Update existing properties to be published and available
UPDATE properties 
SET published = true, available = true 
WHERE published IS NULL OR available IS NULL;

-- 4. Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_properties_published_available ON properties(published, available);
CREATE INDEX IF NOT EXISTS idx_properties_name_location ON properties USING gin(to_tsvector('french', name || ' ' || location));
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_per_night);
CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(category);

-- 5. Grant necessary permissions
GRANT SELECT ON properties TO anon;
GRANT SELECT ON properties TO authenticated;

-- 6. Verify the setup
SELECT 
  'Properties table structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- 7. Show sample published properties
SELECT 
  'Sample published properties:' as info,
  id,
  name,
  location,
  price_per_night,
  published,
  available
FROM properties 
WHERE published = true 
LIMIT 5;
