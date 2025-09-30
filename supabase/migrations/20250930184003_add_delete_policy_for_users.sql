/*
  # Add DELETE policy for users table

  1. Changes
    - Add policy to allow anon users to delete user records
    - This enables admins to delete employees from the admin portal

  2. Security Note
    - Since we're using custom authentication with the anon key, we need to allow anon deletes
    - In production, you should add application-level checks or use proper role-based access
*/

-- Policy: Allow anon users to delete users (for admin management)
CREATE POLICY "Allow delete for user management"
  ON users
  FOR DELETE
  TO anon, authenticated
  USING (true);
