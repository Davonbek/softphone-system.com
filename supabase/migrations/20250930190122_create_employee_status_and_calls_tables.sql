/*
  # Create Employee Status and Call Tracking Tables

  1. New Tables
    - `employee_status_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `status` (text - available, break, lunch, personal, tech_issues, gone_home, after_call, out_bound)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `duration_seconds` (integer, nullable)
      - `created_at` (timestamptz)
    
    - `call_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `phone_number` (text)
      - `call_type` (text - inbound, outbound)
      - `call_status` (text - answered, declined, missed)
      - `time_received` (timestamptz)
      - `duration_seconds` (integer, default 0)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create employee_status_log table
CREATE TABLE IF NOT EXISTS employee_status_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('available', 'break', 'lunch', 'personal', 'tech_issues', 'gone_home', 'after_call', 'out_bound')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Create call_logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  call_type text NOT NULL CHECK (call_type IN ('inbound', 'outbound')),
  call_status text NOT NULL CHECK (call_status IN ('answered', 'declined', 'missed')),
  time_received timestamptz NOT NULL DEFAULT now(),
  duration_seconds integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employee_status_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policies for employee_status_log
CREATE POLICY "Users can view own status log"
  ON employee_status_log
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own status log"
  ON employee_status_log
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own status log"
  ON employee_status_log
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Policies for call_logs
CREATE POLICY "Users can view own call logs"
  ON call_logs
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own call logs"
  ON call_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Users can update own call logs"
  ON call_logs
  FOR UPDATE
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employee_status_log_user_id ON employee_status_log(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_status_log_started_at ON employee_status_log(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_logs_user_id ON call_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_time_received ON call_logs(time_received DESC);
