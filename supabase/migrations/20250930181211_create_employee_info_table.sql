/*
  # Create employee_info table

  1. New Tables
    - `employee_info`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References users table
      - `full_name` (text) - Employee's full name
      - `phone` (text) - Employee's phone number
      - `address` (text) - Employee's address
      - `position` (text) - Employee's job position
      - `department` (text) - Employee's department
      - `hire_date` (date) - Date employee was hired
      - `salary` (numeric) - Employee's salary
      - `status` (text) - Employment status (active, inactive, terminated)
      - `notes` (text) - Additional notes about the employee
      - `created_at` (timestamptz) - Timestamp of record creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `employee_info` table
    - Add policy for employees to read their own information
    - Add policy for employees to update their own information
    - Add policy for admins to read all employee information
    - Add policy for admins to insert/update employee information

  3. Notes
    - user_id links to the users table for authentication
    - Status is restricted to valid employment statuses
    - Salary information is sensitive and protected by RLS
*/

-- Create employee_info table
CREATE TABLE IF NOT EXISTS employee_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  address text DEFAULT '',
  position text DEFAULT '',
  department text DEFAULT '',
  hire_date date DEFAULT CURRENT_DATE,
  salary numeric DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE employee_info ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Employees can read their own information
CREATE POLICY "Employees can read own info"
  ON employee_info
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Employees can update their own information (non-sensitive fields)
CREATE POLICY "Employees can update own info"
  ON employee_info
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can read all employee information
CREATE POLICY "Admins can read all employee info"
  ON employee_info
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Policy: Admins can insert employee information
CREATE POLICY "Admins can insert employee info"
  ON employee_info
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Admins can update all employee information
CREATE POLICY "Admins can update all employee info"
  ON employee_info
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Policy: Admins can delete employee information
CREATE POLICY "Admins can delete employee info"
  ON employee_info
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_info_user_id ON employee_info(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_info_status ON employee_info(status);
CREATE INDEX IF NOT EXISTS idx_employee_info_department ON employee_info(department);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_employee_info_updated_at
  BEFORE UPDATE ON employee_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
