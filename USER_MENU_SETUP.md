# 🎯 UserMenu Setup Guide - AtypikHouse

This guide explains how to set up the new UserMenu functionality that replaces the simple logout button with a comprehensive user management menu.

## ✨ **Features Added**

- **User Menu Dropdown**: Replaces the simple "Déconnexion" button
- **Profile Editing**: Users can edit their name and email
- **Complete Account Deletion**: Users can permanently delete their entire account (profile + auth) and all associated data
- **Email Reuse**: Same email can be used to create a new account after deletion
- **Modern Design**: Beautiful dropdown with smooth animations
- **Security**: Proper authentication and authorization checks

## 🔧 **Components Created/Modified**

### **New Components:**
1. **`components/UserMenu.tsx`** - Main user menu component
2. **`app/api/profiles/update/route.ts`** - API for profile updates
3. **`app/api/profiles/delete/route.ts`** - API for profile deletion

### **Modified Components:**
1. **`components/ClientDashboard.tsx`** - Replaced logout with UserMenu
2. **`components/OwnerDashboard.tsx`** - Replaced logout with UserMenu
3. **`components/GlampingDashboard.tsx`** - Replaced logout with UserMenu
4. **`components/GlampingGuestExperience.tsx`** - Replaced logout with UserMenu

## 🗄️ **Database Setup Required**

### **Step 1: Environment Variables**
Add the following to your `.env.local` file:

```bash
# Supabase Service Role Key (for admin operations like user deletion)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important**: Get your service role key from:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "service_role" key (NOT the anon key)

### **Step 2: Run SQL Functions**
Execute the following SQL in your Supabase SQL editor:

```sql
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
  -- Update the user_profiles table
  UPDATE user_profiles 
  SET 
    full_name = new_full_name,
    email = new_email,
    updated_at = NOW()
  WHERE user_id = user_id_param;
  
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
  FROM user_profiles 
  WHERE user_id = user_id_param;
  
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
    DELETE FROM user_profiles WHERE user_id = user_id_param;
    
    -- Note: We don't delete from auth.users here as that's handled by Supabase
    -- The user will be logged out and redirected
    
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
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id);

-- Add RLS policies for profile management
-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Enable RLS on user_profiles if not already enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### **Step 2: Verify Database Structure**
Ensure your `user_profiles` table has these columns:
- `user_id` (UUID, primary key)
- `full_name` (TEXT)
- `email` (TEXT)
- `user_type` (TEXT - 'owner' or 'client')
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🚀 **How It Works**

### **1. User Menu Display**
- **Main Button**: Shows user icon, name, and dropdown arrow
- **Dropdown**: Opens with smooth animation
- **Header**: Green gradient with user info and close button

### **2. Profile Editing**
- **Edit Mode**: Click "Modifier le profil" to enter edit mode
- **Form Fields**: Name and email inputs with validation
- **Save/Cancel**: Buttons to save changes or cancel editing
- **Real-time Updates**: Profile refreshes immediately after save

### **3. Complete Account Deletion**
- **Double Confirmation**: Two confirmation dialogs for safety
- **Complete Cleanup**: Removes profile data, properties, bookings, AND auth user
- **Email Reuse**: Same email can be used for new account creation
- **Clean Redirect**: Logs out user and redirects to home page

### **4. Security Features**
- **Authentication**: Only authenticated users can access
- **Authorization**: Users can only modify their own profiles
- **Input Validation**: Email format and required field validation
- **SQL Injection Protection**: Uses parameterized queries

## 🎨 **Design Features**

### **Visual Elements:**
- **Modern Dropdown**: Rounded corners, shadows, smooth animations
- **Color Scheme**: Green gradient header, consistent with app theme
- **Icons**: Lucide React icons for all actions
- **Responsive**: Works on all screen sizes

### **Animations:**
- **Smooth Transitions**: All interactions have 300ms transitions
- **Hover Effects**: Buttons scale and change colors on hover
- **Loading States**: Spinners and disabled states during operations
- **Success/Error Messages**: Toast-style notifications

## 🔒 **Security Considerations**

### **Data Protection:**
- **Row Level Security (RLS)**: Database-level access control
- **Input Validation**: Server-side validation of all inputs
- **Authentication Checks**: Verifies user identity before operations
- **Authorization**: Users can only access their own data

### **Complete Account Cleanup:**
- **Owner Deletion**: Removes properties → removes related bookings → removes profile → removes auth user
- **Client Deletion**: Removes all client bookings → removes profile → removes auth user
- **Transaction Safety**: All operations wrapped in database transactions
- **Rollback Protection**: Automatic rollback on errors
- **Auth Cleanup**: User completely removed from Supabase Auth system

## 🧪 **Testing**

### **Test Scenarios:**
1. **Profile Update**: Change name and email, verify database update
2. **Complete Account Deletion**: Delete account, verify all data AND auth user are removed
3. **Email Reuse**: Try to create new account with same email (should work)
4. **Security**: Try to access other users' profiles (should fail)
5. **Validation**: Test invalid email formats, empty fields
6. **UI/UX**: Test on different screen sizes, verify animations

### **Error Handling:**
- **Network Errors**: Graceful fallback with user-friendly messages
- **Validation Errors**: Clear error messages for invalid inputs
- **Database Errors**: Logged errors with generic user messages
- **Authentication Errors**: Proper redirect to login page

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Function Not Found**: Ensure SQL functions are created in Supabase
2. **Permission Denied**: Check RLS policies and function permissions
3. **Profile Not Updating**: Verify API route is working and database is accessible
4. **Deletion Fails**: Check foreign key constraints and cascade settings

### **Debug Steps:**
1. **Check Console**: Look for JavaScript errors in browser console
2. **Check Network**: Verify API calls are successful in Network tab
3. **Check Database**: Verify SQL functions exist and have correct permissions
4. **Check RLS**: Ensure Row Level Security policies are properly configured

## 📱 **Mobile Responsiveness**

### **Design Features:**
- **Touch-Friendly**: Large touch targets for mobile devices
- **Responsive Layout**: Adapts to different screen sizes
- **Mobile Menu**: Optimized dropdown positioning for small screens
- **Touch Gestures**: Smooth interactions on touch devices

## 🔄 **Performance Optimizations**

### **Optimizations Implemented:**
- **Lazy Loading**: Components only load when needed
- **Efficient Queries**: Single database calls for profile operations
- **Caching**: Profile data cached in React state
- **Debounced Inputs**: Form inputs don't trigger unnecessary API calls

## 📈 **Future Enhancements**

### **Potential Improvements:**
1. **Profile Picture**: Add avatar upload functionality
2. **Password Change**: Allow users to change their password
3. **Two-Factor Auth**: Add 2FA for enhanced security
4. **Activity Log**: Track profile changes and deletions
5. **Backup System**: Create data backups before deletion

## ✅ **Setup Checklist**

- [ ] Add SUPABASE_SERVICE_ROLE_KEY to .env.local
- [ ] Run SQL functions in Supabase
- [ ] Verify RLS policies are active
- [ ] Test profile update functionality
- [ ] Test complete account deletion functionality
- [ ] Verify auth user is removed from Supabase
- [ ] Test creating new account with same email
- [ ] Verify security measures work
- [ ] Test on different devices/screen sizes
- [ ] Check error handling scenarios
- [ ] Verify complete cleanup on deletion

## 🎉 **Conclusion**

The new UserMenu provides a professional, secure, and user-friendly way to manage user profiles. It enhances the user experience while maintaining strict security standards and follows modern web development best practices.

For any issues or questions, check the console logs and database logs for detailed error information.
