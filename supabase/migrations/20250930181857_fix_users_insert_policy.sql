/*
  # Fix INSERT policy for users table

  1. Changes
    - Drop the previous authenticated-only insert policy
    - Add policy to allow anon users to insert into users table
    - This is needed because we're not using Supabase Auth, just the database

  2. Security Note
    - Since we're using custom authentication with the anon key, we need to allow anon inserts
    - In production, you should add application-level checks or use Supabase Auth properly
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can insert users" ON users;

-- Policy: Allow anon users to insert new users (for admin registration)
CREATE POLICY "Allow insert for user registration"
  ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
