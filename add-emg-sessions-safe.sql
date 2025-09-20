-- Safe EMG Sessions setup - handles all potential conflicts
DO $$ 
BEGIN
    -- Create table if not exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'emg_sessions') THEN
        CREATE TABLE emg_sessions (
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
            user_id TEXT NOT NULL,
            session_data JSONB NOT NULL,
            emg_history JSONB NOT NULL,
            timestamp BIGINT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'EMG sessions table created';
    END IF;

    -- Create indexes if not exists
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'emg_sessions' AND indexname = 'idx_emg_sessions_user_id') THEN
        CREATE INDEX idx_emg_sessions_user_id ON emg_sessions(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_indexes WHERE tablename = 'emg_sessions' AND indexname = 'idx_emg_sessions_created_at') THEN
        CREATE INDEX idx_emg_sessions_created_at ON emg_sessions(created_at DESC);
    END IF;

    -- Enable RLS if not already enabled
    IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'emg_sessions' AND rowsecurity = true) THEN
        ALTER TABLE emg_sessions ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Create policy if not exists
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'emg_sessions' AND policyname = 'Users can access their own EMG sessions') THEN
        CREATE POLICY "Users can access their own EMG sessions" ON emg_sessions
            FOR ALL USING (auth.uid()::text = user_id);
    END IF;

    RAISE NOTICE 'EMG sessions setup completed successfully';
END $$;