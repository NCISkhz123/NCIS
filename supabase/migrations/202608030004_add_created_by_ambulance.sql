-- Add created_by column to ambulance_transactions
ALTER TABLE public.ambulance_transactions 
ADD COLUMN created_by UUID REFERENCES public.profiles(user_id);

-- Make it populate by default for new transactions
ALTER TABLE public.ambulance_transactions
ALTER COLUMN created_by SET DEFAULT auth.uid();
