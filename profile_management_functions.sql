-- Profile Management Functions for AtypikHouse
-- This file contains SQL functions for updating and deleting user profiles

-- Function to update user profile (name and email)
CREATE OR REPLACE FUNCTION update_user_profile(
  user_id_param UUID,
  new_full_name TEXT,
  new_email TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Update the profiles table (same as useAuth.ts)
  UPDATE profiles 
  SET 
    full_name = new_full_name,
    email = new_email,
    updated_at = NOW()
  WHERE id = user_id_param;
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Profil mis à jour avec succès'
  );
  
  RETURN result;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  result := json_build_object(
    'success', false,
    'error', SQLERRM
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete user profile and all related data
CREATE OR REPLACE FUNCTION delete_user_profile(user_id_param UUID) RETURNS JSON AS $$
DECLARE
  result JSON;
  user_type_val TEXT;
BEGIN
  -- Get user type first
  SELECT user_type INTO user_type_val 
  FROM profiles 
  WHERE id = user_id_param;
  
  -- Start transaction
  BEGIN
    -- Delete all related data based on user type
    IF user_type_val = 'owner' THEN
      -- Delete owner's properties first
      DELETE FROM properties WHERE owner_id = user_id_param;
      
      -- Delete owner's bookings (these will cascade from properties)
      -- But also delete any direct bookings
      DELETE FROM bookings WHERE property_id IN (
        SELECT id FROM properties WHERE owner_id = user_id_param
      );
      
    ELSIF user_type_val = 'client' THEN
      -- Delete client's bookings
      DELETE FROM bookings WHERE client_id = user_id_param;
    END IF;
    
    -- Delete user profile
    DELETE FROM profiles WHERE id = user_id_param;
    
    -- Note: Auth user deletion is handled by the API route using service role
    -- This ensures complete cleanup of the user account
    
    -- Return success
    result := json_build_object(
      'success', true,
      'message', 'Profil et toutes les données associées supprimés avec succès'
    );
    
    RETURN result;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback transaction
    RAISE EXCEPTION 'Erreur lors de la suppression: %', SQLERRM;
  END;
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  result := json_build_object(
    'success', false,
    'error', SQLERRM
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_user_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_profile(UUID) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);

-- Add RLS policies for profile management
-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
