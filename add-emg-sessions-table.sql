-- Add EMG Sessions table to Supabase
CREATE TABLE IF NOT EXISTS emg_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_data JSONB NOT NULL DEFAULT '{}',
  emg_history JSONB[] NOT NULL DEFAULT '{}',
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_emg_sessions_user_id ON emg_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_emg_sessions_created_at ON emg_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE emg_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can access their own EMG sessions" ON emg_sessions
  FOR ALL USING (user_id = auth.uid()::text);