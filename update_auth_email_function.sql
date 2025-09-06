-- Function to update user email AND display name in auth.users table directly
-- This is a fallback method if the Supabase Admin API fails

CREATE OR REPLACE FUNCTION update_auth_user_email_and_name(user_uuid UUID, new_email TEXT, new_full_name TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the email and raw_user_meta_data in auth.users table
  UPDATE auth.users 
  SET 
    email = new_email,
    email_confirmed_at = NOW(),
    updated_at = NOW(),
    raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'::jsonb),
      '{full_name}',
      to_jsonb(new_full_name)
    )
  WHERE id = user_uuid;
  
  -- Check if any rows were affected
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with ID % not found in auth.users', user_uuid;
  END IF;
  
  RAISE NOTICE 'Email and display name updated successfully for user % to email: % and name: %', user_uuid, new_email, new_full_name;
END;
$$;

-- Grant execute permission to the service role
GRANT EXECUTE ON FUNCTION update_auth_user_email(UUID, TEXT) TO service_role;

-- Grant usage on auth schema to service role (if not already granted)
GRANT USAGE ON SCHEMA auth TO service_role;
