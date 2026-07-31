CREATE TABLE IF NOT EXISTS public.ambulances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    plate_number TEXT NOT NULL,
    base_price_per_km NUMERIC NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ambulance_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_lat NUMERIC NOT NULL,
    hospital_lng NUMERIC NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ambulance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambulance_id UUID REFERENCES public.ambulances(id) NOT NULL,
    destination_lat NUMERIC NOT NULL,
    destination_lng NUMERIC NOT NULL,
    distance_km NUMERIC NOT NULL,
    total_cost NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic RLS (Enable and add policies as per project standards)
ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read/write for MVP (adjust policies if role-based is needed)
DROP POLICY IF EXISTS "Allow authenticated read on ambulances" ON public.ambulances;
CREATE POLICY "Allow authenticated read on ambulances" ON public.ambulances FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated all on ambulances" ON public.ambulances;
CREATE POLICY "Allow authenticated all on ambulances" ON public.ambulances FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read on ambulance_settings" ON public.ambulance_settings;
CREATE POLICY "Allow authenticated read on ambulance_settings" ON public.ambulance_settings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated all on ambulance_settings" ON public.ambulance_settings;
CREATE POLICY "Allow authenticated all on ambulance_settings" ON public.ambulance_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated read on ambulance_transactions" ON public.ambulance_transactions;
CREATE POLICY "Allow authenticated read on ambulance_transactions" ON public.ambulance_transactions FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated insert on ambulance_transactions" ON public.ambulance_transactions;
CREATE POLICY "Allow authenticated insert on ambulance_transactions" ON public.ambulance_transactions FOR INSERT TO authenticated WITH CHECK (true);
