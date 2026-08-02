ALTER TABLE public.ambulance_transactions
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'IN_USE',
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Grant permissions
GRANT ALL ON public.ambulance_transactions TO authenticated, service_role;
GRANT SELECT ON public.ambulance_transactions TO anon;

-- Update RLS policies to allow update by authenticated users
DROP POLICY IF EXISTS "Allow authenticated update on ambulance_transactions" ON public.ambulance_transactions;
CREATE POLICY "Allow authenticated update on ambulance_transactions" ON public.ambulance_transactions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
