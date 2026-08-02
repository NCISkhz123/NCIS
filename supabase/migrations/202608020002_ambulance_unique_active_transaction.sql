-- supabase/migrations/202608020002_ambulance_unique_active_transaction.sql

-- Creates a unique partial index to prevent double-booking an ambulance.
-- This ensures that for any given ambulance_id, there can be at most one
-- row with status = 'IN_USE'.
CREATE UNIQUE INDEX IF NOT EXISTS single_active_ambulance 
ON public.ambulance_transactions (ambulance_id) 
WHERE status = 'IN_USE';
