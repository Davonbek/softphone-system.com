/*
  # Add UPDATE policy for users table

  1. Changes
    - Add policy to allow anon users to update user records
    - This enables admins to edit employee credentials from the admin portal

  2. Security Note
    - Since we're using custom authentication with the anon key, we need to allow anon updates
    - In production, you should add application-level checks or use proper role-based access
*/

-- Policy: Allow anon users to update users (for admin editing)
CREATE POLICY "Allow update for user management"
  ON users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
