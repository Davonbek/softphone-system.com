/*
  # Fix INSERT policy for employee_info table

  1. Changes
    - Add policy to allow anon users to insert into employee_info table
    - This is needed because we're not using Supabase Auth authentication

  2. Security Note
    - Since we're using custom authentication with the anon key, we need to allow anon inserts
    - The existing admin-only policy remains for authenticated users
*/

-- Policy: Allow anon users to insert employee info (for admin registration)
CREATE POLICY "Allow anon insert for employee registration"
  ON employee_info
  FOR INSERT
  TO anon
  WITH CHECK (true);
