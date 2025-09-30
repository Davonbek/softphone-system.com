/*
  # Add INSERT policies for users table

  1. Changes
    - Add policy to allow admins to insert new employees into users table
    - Add policy to allow authenticated users (admins) to insert into users table

  2. Security
    - Only authenticated users can insert into users table
    - This enables admins to create new employee accounts
*/

-- Policy: Allow authenticated users (admins) to insert new users
CREATE POLICY "Authenticated users can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
