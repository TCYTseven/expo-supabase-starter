-- Add email column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing user profiles to include email from auth.users
UPDATE user_profiles 
SET email = auth.users.email
FROM auth.users 
WHERE user_profiles.id = auth.users.id 
AND user_profiles.email IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.email IS 'User email address copied from auth.users for easier access';

-- Optionally create an index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email); 