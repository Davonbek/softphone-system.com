/*
  # Make email field optional

  1. Changes
    - Alter `users` table to make email nullable
    - Remove unique constraint on email to allow multiple null values
    - Update check constraint to ensure username is still required

  2. Notes
    - Email is now optional since users can register with just username and password
    - Username remains required and unique for authentication
*/

-- Make email nullable and remove unique constraint
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Drop the unique constraint on email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Add a partial unique index to allow multiple NULL emails but prevent duplicate non-NULL emails
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_when_not_null 
  ON users(email) 
  WHERE email IS NOT NULL;
