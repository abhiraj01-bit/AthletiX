-- Add EMG Sessions table to existing Supabase database
-- This script only adds the new table without affecting existing data

-- Check if table exists first (safe approach)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emg_sessions') THEN
        -- Create EMG Sessions table
        CREATE TABLE emg_sessions (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id TEXT NOT NULL,
            session_data JSONB NOT NULL,
            emg_history JSONB NOT NULL,
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Add index for performance
        CREATE INDEX idx_emg_sessions_user_id ON emg_sessions(user_id);
        CREATE INDEX idx_emg_sessions_created_at ON emg_sessions(created_at DESC);

        -- Enable RLS
        ALTER TABLE emg_sessions ENABLE ROW LEVEL SECURITY;

        -- Add RLS policy
        CREATE POLICY "Users can access their own EMG sessions" ON emg_sessions
            FOR ALL USING (auth.uid()::text = user_id);

        RAISE NOTICE 'EMG sessions table created successfully';
    ELSE
        RAISE NOTICE 'EMG sessions table already exists';
    END IF;
END $$;