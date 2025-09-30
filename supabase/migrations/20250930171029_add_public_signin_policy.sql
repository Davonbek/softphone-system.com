/*
  # Add public sign-in policy

  1. Changes
    - Add policy to allow public read access to users table for authentication purposes
    - This allows the sign-in flow to query user credentials without being authenticated first
  
  2. Security
    - Policy is restricted to SELECT operations only
    - Does not expose sensitive operations like INSERT, UPDATE, or DELETE to public
*/

CREATE POLICY "Allow public read for sign-in"
  ON users
  FOR SELECT
  TO anon
  USING (true);