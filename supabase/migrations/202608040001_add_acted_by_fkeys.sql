-- Add foreign key constraints for acted_by to profiles table

ALTER TABLE public.stock_movements 
ADD CONSTRAINT fk_stock_movements_acted_by 
FOREIGN KEY (acted_by) REFERENCES public.profiles(user_id)
ON DELETE SET NULL;

ALTER TABLE public.laundry_stock_movements 
ADD CONSTRAINT fk_laundry_stock_movements_acted_by 
FOREIGN KEY (acted_by) REFERENCES public.profiles(user_id)
ON DELETE SET NULL;
